import axios from "axios";
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import AdminTestList from "./AdminTestList";

interface Student {
  id: number;
  name: string;
  email: string;
  status: "online" | "offline";
  tabSwitchCount: number;
  socketId: string;
}

function AdminDashboard() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  
  // Socket and real-time state
  const socketRef = useRef<Socket | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [started,setstarted]=useState(false)
  // Test management state
  const [generatedCode, setGeneratedCode] = useState("");
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    options: ["", "", "", ""],
    correctAnswer: "",
  });
  const [activeTab, setActiveTab] = useState("create");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [testStatus, setTestStatus] = useState("not_started");
  const [testId, setTestId] = useState<number | null>(null);
  const navigate = useNavigate();

  // Initialize socket connection and auth check
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You are not logged in");
      navigate("/");
      return;
    }

    try {
      jwtDecode(token);
      
      // Load saved state from localStorage
      const savedCode = localStorage.getItem('currentTestCode');
      const savedQuestions = localStorage.getItem('currentTestQuestions');
      const savedStatus = localStorage.getItem('currentTestStatus');
      const savedTestId = localStorage.getItem('currentTestId');
      
      if (savedCode) setGeneratedCode(savedCode);
      if (savedQuestions) setQuestions(JSON.parse(savedQuestions));
      if (savedStatus) setTestStatus(savedStatus);
      if (savedTestId) setTestId(parseInt(savedTestId));

      // Initialize socket connection
      initializeSocket();
      
    } catch (err) {
      console.error("Invalid token", err);
      alert("Invalid token");
      localStorage.removeItem("token");
      navigate("/home");
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [navigate]);

  const initializeSocket = () => {
    socketRef.current = io("https://examguard-server.onrender.com", {
      auth: {
        token: localStorage.getItem("token")
      }
    });

    socketRef.current.on("connect", () => {
      console.log("Socket connected:", socketRef.current?.id);
      setIsSocketConnected(true);
    });

    socketRef.current.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsSocketConnected(false);
    });

    // Listen for student events
    socketRef.current.on("student-joined", (student: Student) => {
      console.log("Student joined:", student);
      setStudents(prev => {
        const existing = prev.find(s => s.id === student.id);
        if (existing) {
          return prev.map(s => s.id === student.id ? student : s);
        }
        return [...prev, student];
      });
    });

    socketRef.current.on("student-updated", (student: Student) => {
      console.log("Student updated:", student);
      setStudents(prev => 
        prev.map(s => s.id === student.id ? student : s)
      );
    });

    socketRef.current.on("student-list", (studentList: Student[]) => {
      console.log("Received student list:", studentList);
      setStudents(studentList);
    });

    socketRef.current.on("error", (error) => {
      console.error("Socket error:", error);
      
    });
  };

  // Join test room when code is available
  useEffect(() => {
    if (generatedCode && socketRef.current && isSocketConnected) {
      console.log("Admin joining test room:", generatedCode);
      socketRef.current.emit("admin-join-test", { testCode: generatedCode });
    }
  }, [generatedCode, isSocketConnected]);

  const generateTestCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedCode(result);
    localStorage.setItem('currentTestCode', result);
  };

  const addQuestion = () => {
    if (newQuestion.text.trim() === "") return;
    if (newQuestion.options.some(opt => opt.trim() === "")) {
      alert("Please fill all options");
      return;
    }
    if (!newQuestion.correctAnswer) {
      alert("Please select a correct answer");
      return;
    }
    
    const updatedQuestions = [...questions, newQuestion];
    setQuestions(updatedQuestions);
    localStorage.setItem('currentTestQuestions', JSON.stringify(updatedQuestions));
    
    setNewQuestion({
      text: "",
      options: ["", "", "", ""],
      correctAnswer: "",
    });
  };

  const startTest = async() => {
    setstarted(true);
    if (!generatedCode) {
      alert("Please generate a test code first");
      return;
    }

    if (!socketRef.current) {
      alert("Socket connection not available");
      return;
    }

    if (questions.length === 0) {
      alert("Please add questions before starting the test");
      return;
    }
   
    console.log("Starting test via socket:", generatedCode);
    socketRef.current.emit("admin-start-test", { testCode: generatedCode,questions:questions,testId:testId });
    
    setTestStatus("in_progress");
    localStorage.setItem('currentTestStatus', "in_progress");
    alert("Test started successfully! Questions sent to all students.");
  };

  const endTest = () => {
    if (!socketRef.current || !generatedCode) return;

    console.log("Ending test via socket:", generatedCode);
    socketRef.current.emit("admin-end-test", { testCode: generatedCode });
    
    setTestStatus("completed");
    setStudents([]);
    
    // Clear saved state
    localStorage.removeItem('currentTestCode');
    localStorage.removeItem('currentTestQuestions');
    localStorage.removeItem('currentTestStatus');
    localStorage.removeItem('currentTestId');
    
    setGeneratedCode("");
    setQuestions([]);
    setTestId(null);
    reset();
    alert("Test ended successfully!");
  };

  const onSubmit = async (data) => {
  if (!generatedCode) {
    alert("Please generate a test code first");
    return;
  }

  if (questions.length === 0) {
    alert("Please add at least one question");
    return;
  }

  setIsSubmitting(true);
  setSubmitError("");

  try {
    // Create the test with questions
    const testResponse = await fetch(
      "https://examguard-server.onrender.com/api/test/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title: data.testTitle,
          description: data.description,
          code: generatedCode,
          duration: parseInt(data.duration),
          // questions: questions.map(q => ({
          //   text: q.text,
          //   options: q.options,
          //   answer: q.correctAnswer
          // }))addQuestionsToTest
        }),
      }
    );
    
    if (!testResponse.ok) throw new Error("Failed to create test");
    const testData = await testResponse.json();
    
    localStorage.setItem('currentTestId', testData.id.toString());
    setTestId(testData.id);
    
    // Now that test is created, admin can join the room
    if (socketRef.current) {
      socketRef.current.emit("admin-join-test", { testCode: generatedCode });
    }

    alert("Test created successfully! Students can now join using the test code.");
    setActiveTab("monitor"); // Switch to monitor tab
  } catch (error) {
    console.error("Error creating test:", error);
    setSubmitError(error.message || "Failed to create test");
  } finally {
    setIsSubmitting(false);
  }
};

// Add this useEffect to handle adding questions when testId changes
// useEffect(() => {
//   const addQuestionsToTest = async () => {
//     if (!testId || questions.length === 0) return;
    
//     try {
//       const res = await axios.post(
//         `http://localhost:3000/api/test/${testId}/questions`,
//         questions,
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );
//       console.log('Questions added:', res.data);
//     } catch (err) {
//       console.error('Error adding questions:', err);
//     }
//   };

//   addQuestionsToTest();
// }, [testId]);
  
  const resetForm = () => {
    setQuestions([]);
    setNewQuestion({
      text: "",
      options: ["", "", "", ""],
      correctAnswer: "",
    });
    localStorage.removeItem('currentTestQuestions');
  };
  const handleview=()=>{
    setActiveTab("view");
  }

  const getConnectionStatus = () => {
    if (!socketRef.current) return "Not Connected";
    return isSocketConnected ? "Connected" : "Connecting...";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">ExamGuard</h1>
          </div>
          
          <nav className="flex space-x-6 items-center">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isSocketConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">{getConnectionStatus()}</span>
            </div>
            <button
             type="submit"
              onClick={()=>setActiveTab("create")}
              className={`px-3 py-2 font-medium ${
                activeTab === "create"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Create Test
            </button>
            <button
              onClick={() => setActiveTab("monitor")}
              className={`px-3 py-2 font-medium ${
                activeTab === "monitor"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Live Monitor ({students.length})
            </button>
                <button
             type="submit"
              onClick={handleview}
              className={`px-3 py-2 font-medium ${
                activeTab === "view"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              View Tests
            </button>
          </nav>
        </div>
      </header>
      {testId}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {activeTab === "create" ? (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Create New Test
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="testTitle" className="block text-sm font-medium text-gray-700">
                    Test Title
                  </label>
                  <input
                    type="text"
                    id="testTitle"
                    {...register("testTitle", { required: "Test title is required" })}
                    className={`mt-1 block w-full rounded-md border ${
                      errors.testTitle ? "border-red-300" : "border-gray-300"
                    } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2`}
                  />
                  {errors.testTitle && (
                    <p className="mt-1 text-sm text-red-600">{errors.testTitle.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    id="duration"
                    {...register("duration", {
                      required: "Duration is required",
                      min: { value: 1, message: "Duration must be at least 1 minute" },
                    })}
                    className={`mt-1 block w-full rounded-md border ${
                      errors.duration ? "border-red-300" : "border-gray-300"
                    } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2`}
                  />
                  {errors.duration && (
                    <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  {...register("description")}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Test Access Code
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    value={generatedCode}
                    readOnly
                    className="block w-full rounded-l-md border border-gray-300 bg-gray-100 p-2 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={generateTestCode}
                    className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Generate Code
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Test Questions ({questions.length})
                </h3>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="mb-4">
                    <label htmlFor="questionText" className="block text-sm font-medium text-gray-700">
                      Question Text
                    </label>
                    <input
                      type="text"
                      id="questionText"
                      value={newQuestion.text}
                      onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {newQuestion.options.map((option, index) => (
                      <div key={index}>
                        <label htmlFor={`option-${index}`} className="block text-sm font-medium text-gray-700">
                          Option {index + 1}
                        </label>
                        <div className="flex items-center">
                          <input
                            type="text"
                            id={`option-${index}`}
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...newQuestion.options];
                              newOptions[index] = e.target.value;
                              setNewQuestion({ ...newQuestion, options: newOptions });
                            }}
                            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                          />
                          <input
                            type="radio"
                            name="correctOption"
                            checked={newQuestion.correctAnswer === option}
                            onChange={() => setNewQuestion({ ...newQuestion, correctAnswer: option })}
                            className="ml-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addQuestion}
                    className="mt-4 inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Add Question
                  </button>
                </div>

                {questions.length > 0 ? (
                  <div className="space-y-4">
                    {questions.map((question, qIndex) => (
                      <div key={qIndex} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-gray-900">
                            {qIndex + 1}. {question.text}
                          </h4>
                          <button
                            type="button"
                            onClick={() => {
                              const updatedQuestions = [...questions];
                              updatedQuestions.splice(qIndex, 1);
                              setQuestions(updatedQuestions);
                              localStorage.setItem('currentTestQuestions', JSON.stringify(updatedQuestions));
                            }}
                            className="text-red-600 hover:text-red-900 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                        <ul className="mt-2 space-y-2">
                          {question.options.map((option, oIndex) => {
                            const isCorrect = option === question.correctAnswer;
                            return (
                              <li
                                key={oIndex}
                                className={`pl-4 ${
                                  isCorrect ? "text-green-600 font-medium" : "text-gray-700"
                                }`}
                              >
                                {String.fromCharCode(65 + oIndex)}. {option}
                                {isCorrect && (
                                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                    Correct
                                  </span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No questions added yet</p>
                )}
              </div>

              {submitError && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{submitError}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center rounded-md border border-transparent bg-gray-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Clear Form
                </button>
                <button
                  type="submit"
                 
                  disabled={isSubmitting || !isSocketConnected}
                  className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Creating..." : "Create Test"}
                </button>
              </div>
            </form>
          </div>
        ) : activeTab==="monitor"?(
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Live Test Monitor
              </h2>

              <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-blue-700">Test Code</div>
                  <div className="text-lg font-mono text-blue-900">
                    {generatedCode || "Not generated"}
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-green-700">Students Online</div>
                  <div className="text-lg font-bold text-green-900">
                    {students.filter(s => s.status === "online").length}
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-yellow-700">Test Status</div>
                  <div className={`text-lg font-bold ${
                    testStatus === "in_progress" ? "text-green-900" :
                    testStatus === "completed" ? "text-red-900" :
                    "text-gray-900"
                  }`}>
                    {testStatus === "in_progress" ? "In Progress" :
                     testStatus === "completed" ? "Completed" : "Not Started"}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tab Violations
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.length > 0 ? (
                      students.map((student) => (
                        <tr key={student.id} className={student.status === "offline" ? "opacity-60" : ""}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {student.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              student.status === "online" 
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}>
                              {student.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`font-medium ${
                              student.tabSwitchCount > 5 ? "text-red-600" :
                              student.tabSwitchCount > 2 ? "text-yellow-600" :
                              "text-gray-600"
                            }`}>
                              {student.tabSwitchCount}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button 
                              className="text-red-600 hover:text-red-900 text-sm font-medium"
                              disabled={testStatus !== "in_progress"}
                            >
                              Warn
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                          {testStatus === "not_started" 
                            ? "Create and publish a test for students to join" 
                            : "No students have joined yet"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-between">
                <div>
                  <button 
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={testStatus !== "completed"}
                  >
                    Download Report
                  </button>
                </div>
                <div className="space-x-3">
                  <button
                    onClick={startTest}
                    disabled={!generatedCode || questions.length === 0 || !isSocketConnected || started}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Start Test
                  </button>
                  <button
                    onClick={endTest}
                    disabled={testStatus !== "in_progress" || !isSocketConnected}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    End Test
                  </button>
                </div>
              </div>
            </div>
          </div>
        ): activeTab === "view" ? (<AdminTestList/>):(<h1></h1>)}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © 2025 ExamGuard. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default AdminDashboard;
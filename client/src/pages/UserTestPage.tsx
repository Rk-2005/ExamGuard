import React, { useEffect, useState, useRef } from "react";
import { Clock, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
// Import real socket.io-client instead of mock
import {jwtDecode} from "jwt-decode";

import { io } from "socket.io-client";
import LogoutButton from "./Logout";

interface Question {
  id: number;
  text: string;
  options: string[];
}

interface TestData {
  testTitle: string;
  duration: number;
  questions: Question[];
  startTime: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

function UserTestPage() {
  // Socket and connection state
  const socketRef = useRef<any>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  // User and auth state
  const [user, setUser] = useState<User | null>(null);

  // Test joining state
  const [testCode, setTestCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState("");

  // Test state
  const [testData, setTestData] = useState<TestData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{[questionId: number]: string}>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [testStatus, setTestStatus] = useState<"waiting" | "in_progress" | "completed">("waiting");

  // Proctoring state
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isTabActive, setIsTabActive] = useState(true);
  const [showWarning, setShowWarning] = useState(false);

  // Test completion state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Initialize auth and socket

useEffect(() => {
  const token = localStorage.getItem('token');
  console.log("Token from localStorage:", token);

  if (token) {
    try {
      const decoded = jwtDecode(token); // Will contain user info if encoded that way
      console.log("Decoded JWT:", decoded);
      setUser(decoded);
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  } else {
    // Optional fallback
    setUser({ id: 1, name: "Test Student", email: "student@example.com" });
  }

  initializeSocket();

  return () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };
}, []);


  // Initialize real socket connection
const initializeSocket = () => {
  const socket = io("https://examguard-server.onrender.com",{
    transports: ["websocket"], // ✅ Force WebSocket only
    withCredentials: true  
  }); // use real backend socket
  socketRef.current = socket;

  socket.on("connect", () => {
    console.log("Connected to server");
    setIsSocketConnected(true);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from server");
    setIsSocketConnected(false);
  });

  socket.on("join-success", (data: any) => {
    console.log("Successfully joined test:", data);
    setTestStatus("waiting");
    setJoinError("");
  });

  socket.on("test-started", (data: TestData) => {
    console.log("stat")
    console.log("Test started with real data:", data);
    setTestData(data);
    setTimeRemaining(data.duration);
    setTestStatus("in_progress");
    setCurrentQuestionIndex(0);
    setAnswers({});
  });

  socket.on("test-ended", () => {
    console.log("Test ended by admin");
    setTestStatus("completed");
  });

  socket.on("error", (error: any) => {
    console.error("Socket error:", error);
    setJoinError(error.message);
    setIsJoining(false);
  });
};


  // Timer countdown
  useEffect(() => {
    if (testStatus === "in_progress" && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);


      return () => clearInterval(timer);
    }
  }, [testStatus, timeRemaining]);

  // Proctoring - Tab visibility detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      setIsTabActive(isVisible);

      if (!isVisible && testStatus === "in_progress") {
        const newCount = tabSwitchCount + 1;
        setTabSwitchCount(newCount);

        // Send violation to backend
        if (socketRef.current && user && testCode) {
          socketRef.current.emit("student-tab-violation", {
            testCode,
            userId: user.id,
            reason: "tab_switch"
          });
        }

        // Show warning
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 3000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [testStatus, tabSwitchCount, user, testCode]);

  // Prevent right-click and key shortcuts during test
  useEffect(() => {
    if (testStatus === "in_progress") {
      const preventRightClick = (e: MouseEvent) => e.preventDefault();
      const preventKeyShortcuts = (e: KeyboardEvent) => {
        if (e.key === "F12" || 
            (e.ctrlKey && (e.key === "u" || e.key === "s" || e.key === "r")) || 
            (e.ctrlKey && e.shiftKey && e.key === "I")) {
          e.preventDefault();
        }
      };

      document.addEventListener("contextmenu", preventRightClick);
      document.addEventListener("keydown", preventKeyShortcuts);

      return () => {
        document.removeEventListener("contextmenu", preventRightClick);
        document.removeEventListener("keydown", preventKeyShortcuts);
      };
    }
  }, [testStatus]);

  // Join test function
  const handleJoinTest = async () => {
    if (!testCode.trim()) {
      setJoinError("Please enter a test code");
      return;
    }

    if (!user || !socketRef.current) {
      setJoinError("Connection not ready");
      return;
    }

    setIsJoining(true);
    setJoinError("");

    try {
      // Emit student-join-test event with real data
       
      socketRef.current.emit("student-join-test", {
        testCode: testCode.toUpperCase(),
        userId: user.id
      });
      
      console.log("Emitted student-join-test with:", {
        testCode: testCode.toUpperCase(),
        userId: user.id
      });
    } catch (error) {
      console.error("Error joining test:", error);
      setJoinError("Failed to join test");
      setIsJoining(false);
    }
  };

  // Handle answer selection
  const handleAnswerSelect = (questionId: number, selectedOption: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: selectedOption
    }));

    // Send answer to backend immediately
    if (socketRef.current && user) {
      socketRef.current.emit("student-submit-answer", {
        testCode,
        userId: user.id,
        questionId,
        selected: selectedOption
      });
    }
  };

  // Submit test
  const handleSubmitTest = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      setTestStatus("completed");
    } catch (error) {
      console.error("Error submitting test:", error);
      setSubmitError("Failed to submit test");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format time display
  const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

  // Get connection status
  const getConnectionStatus = () => {
    if (!socketRef.current) return "Not Connected";
    return isSocketConnected ? "Connected" : "Connecting...";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ExamGuard</h1>
                {user && (
                  <p className="text-sm text-gray-600">Welcome, {user.name}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isSocketConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">{getConnectionStatus()}</span>
              </div>
              <LogoutButton></LogoutButton>
              {/* Test Timer */}
              {testStatus === "in_progress" && (
                <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className={`font-mono text-sm ${timeRemaining < 300 ? 'text-red-600' : 'text-blue-600'}`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Tab Switch Warning */}
        {showWarning && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Tab Switch Detected!
                </h3>
                <p className="text-sm text-red-700">
                  You switched tabs or lost focus. This has been recorded. Total violations: {tabSwitchCount}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Test Code Entry - Only show when not joined */}
        {testStatus === "waiting" && !testData && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Join Test
            </h2>
            
            <div className="max-w-md mx-auto">
              <div className="mb-4">
                <label htmlFor="testCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Test Code
                </label>
                <input
                  type="text"
                  id="testCode"
                  value={testCode}
                  onChange={(e) => setTestCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg font-mono"
                  placeholder="Enter test code"
                  maxLength={10}
                  disabled={isJoining}
                />
              </div>
              
              {joinError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{joinError}</p>
                </div>
              )}
              
              <button
                onClick={handleJoinTest}
                disabled={isJoining || !isSocketConnected || !testCode.trim()}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isJoining ? "Joined Wait for admin to start test " : "Join Test"}
              </button>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Status:</strong> Ready to join test
                </p>
                <p className="text-sm text-blue-600">
                  Connection: {getConnectionStatus()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Waiting for Test Start - Show after successful join */}
        {testStatus === "waiting" && testCode && !testData && !joinError && !isJoining && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Waiting for Test to Start
            </h2>
            <p className="text-gray-600 mb-4">
              You've successfully joined the test. Please wait for the instructor to start the test.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 inline-block">
              <p className="text-sm text-gray-600">
                Test Code: <span className="font-mono font-bold">{testCode}</span>
              </p>
            </div>
          </div>
        )}

        {/* Test In Progress - Questions from real-time data */}
        {testStatus === "in_progress" && testData && (
          <div className="space-y-6">
            {/* Test Header */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {testData.testTitle}
              </h2>
              <div className="flex justify-between items-center">
                <p className="text-gray-600">
                  Question {currentQuestionIndex + 1} of {testData.questions.length}
                </p>
                <div className="flex items-center space-x-4">
                  {tabSwitchCount > 0 && (
                    <div className="flex items-center space-x-1 text-red-600">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">Violations: {tabSwitchCount}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Current Question */}
            {testData.questions[currentQuestionIndex] && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {testData.questions[currentQuestionIndex].text}
                  </h3>
                  
                  <div className="space-y-3">
                    {testData.questions[currentQuestionIndex].options.map((option, index) => (
                      <label
                        key={index}
                        className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name={`question-${testData.questions[currentQuestionIndex].id}`}
                          value={option}
                          checked={answers[testData.questions[currentQuestionIndex].id] === option}
                          onChange={() => handleAnswerSelect(testData.questions[currentQuestionIndex].id, option)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-3 text-gray-900">
                          {String.fromCharCode(65 + index)}. {option}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <div className="flex space-x-3">
                    {currentQuestionIndex < testData.questions.length - 1 ? (
                      <button
                        onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmitTest}
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? "Submitting..." : "Submit Test"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Question Overview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Question Overview</h4>
              <div className="grid grid-cols-5 gap-2">
                {testData.questions.map((question, index) => (
                  <button
                    key={question.id}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-10 h-10 rounded-lg border text-sm font-medium ${
                      index === currentQuestionIndex
                        ? 'bg-blue-600 text-white border-blue-600'
                        : answers[question.id]
                        ? 'bg-green-100 text-green-800 border-green-300'
                        : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Test Completed */}
        {testStatus === "completed" && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Test Completed
            </h2>
            <p className="text-gray-600 mb-4">
              Your test has been submitted successfully. Thank you for participating.
            </p>
            
            {submitError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{submitError}</p>
              </div>
            )}
            
            <div className="bg-gray-50 rounded-lg p-4 inline-block">
              <p className="text-sm text-gray-600">
                Answered: {Object.keys(answers).length} / {testData?.questions.length || 0} questions
              </p>
              {tabSwitchCount > 0 && (
                <p className="text-sm text-red-600 mt-1">
                  Tab violations: {tabSwitchCount}
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © 2025 ExamGuard. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default UserTestPage;
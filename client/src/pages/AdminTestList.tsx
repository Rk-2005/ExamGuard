import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiClock, FiBarChart2, FiEdit2, FiTrash2 } from "react-icons/fi";

const AdminTestList = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://examguard-server.onrender.com/api/test/my-tests", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTests(res.data);
      } catch (error) {
        console.error("Error fetching admin tests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  const handleDeleteTest = async (testId) => {
    try {
      setDeletingId(testId);
      const token = localStorage.getItem("token");
      await axios.delete(`https://examguard-server.onrender.com/api/test/${testId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTests(tests.filter(test => test.id !== testId));
    } catch (error) {
      console.error("Error deleting test:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Simple CSS spinner component
  const Spinner = () => (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Your Created Tests</h1>
          <button 
            onClick={() => navigate("/create-test")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
          >
            Create New Test
          </button>
        </div>

        {loading ? (
          <Spinner />
        ) : tests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">No tests found</h3>
            <p className="text-gray-500 mb-4">You haven't created any tests yet.</p>
            <button
              onClick={() => navigate("/create-test")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Create Your First Test
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <div key={test.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 truncate">{test.title}</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {test.status || "Draft"}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{test.description || "No description provided"}</p>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <FiClock className="mr-2" />
                    <span>Duration: {test.duration || 0} minutes</span>
                  </div>
                  
                  {test.createdAt && (
                    <div className="text-xs text-gray-400 mb-4">
                      Created: {formatDate(test.createdAt)}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <button
                      onClick={()=>{navigate(`/test-results/${test.id}`)}}
                      className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <FiBarChart2 className="mr-1" />
                      Results
                    </button>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/edit-test/${test.id}`)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="Edit"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteTest(test.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete"
                        disabled={deletingId === test.id}
                      >
                        {deletingId === test.id ? (
                          <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
                        ) : (
                          <FiTrash2 size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTestList;
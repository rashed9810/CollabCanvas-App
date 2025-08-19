import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWhiteboard } from "../context/WhiteboardContext";
import WhiteboardList from "../components/WhiteboardList";
import NewWhiteboardForm from "../components/NewWhiteboardForm";
import LoadingSpinner from "../components/LoadingSpinner";

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const {
    whiteboards,
    loading,
    error,
    getWhiteboards,
    createWhiteboard,
    deleteWhiteboard,
    clearError,
  } = useWhiteboard();
  const navigate = useNavigate();

  // Fetch whiteboards on mount
  useEffect(() => {
    // Only fetch if we don't have whiteboards or if there's an error
    if (whiteboards.length === 0 && !loading && !error) {
      getWhiteboards();
    }

    // Cleanup function
    return () => {
      clearError();
    };
  }, []); // Empty dependency array - only run on mount

  const handleCreateWhiteboard = async (name: string, isPublic: boolean) => {
    try {
      const newWhiteboard = await createWhiteboard(name, isPublic);
      navigate(`/whiteboard/${newWhiteboard._id}`);
    } catch (error) {
      console.error("Failed to create whiteboard:", error);
    }
  };

  const handleDeleteWhiteboard = async (id: string) => {
    try {
      await deleteWhiteboard(id);
    } catch (error) {
      console.error("Failed to delete whiteboard:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-lg text-gray-600">
            Welcome back, {user?.name}! Manage your whiteboards here.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <svg
              className="w-5 h-5 text-red-500 mr-3 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create New Whiteboard */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Create New Whiteboard
              </h2>
              <NewWhiteboardForm onCreate={handleCreateWhiteboard} />
            </div>
          </div>

          {/* Whiteboards List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Your Whiteboards
                </h2>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => getWhiteboards()}
                    disabled={loading}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    title="Refresh whiteboards"
                  >
                    <svg
                      className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </button>
                  <div className="text-sm text-gray-500">
                    {whiteboards.length} whiteboard
                    {whiteboards.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="py-12">
                  <LoadingSpinner size="lg" text="Loading whiteboards..." />
                </div>
              ) : whiteboards.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                    className="w-16 h-16 text-gray-300 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No whiteboards yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Create your first whiteboard to get started with
                    collaborative drawing.
                  </p>
                </div>
              ) : (
                <WhiteboardList
                  whiteboards={whiteboards}
                  currentUser={user!}
                  onDelete={handleDeleteWhiteboard}
                />
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {whiteboards.length}
            </div>
            <div className="text-sm text-gray-600">Total Whiteboards</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {whiteboards.filter((wb) => wb.isPublic).length}
            </div>
            <div className="text-sm text-gray-600">Public Whiteboards</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {whiteboards.filter((wb) => !wb.isPublic).length}
            </div>
            <div className="text-sm text-gray-600">Private Whiteboards</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

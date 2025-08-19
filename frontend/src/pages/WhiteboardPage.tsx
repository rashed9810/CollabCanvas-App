import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWhiteboard } from "../context/WhiteboardContext";
import useCanvas from "../hooks/useCanvas";
import WhiteboardToolbar from "../components/WhiteboardToolbar";
import ChatSidebar from "../components/ChatSidebar";
import CollaboratorManager from "../components/CollaboratorManager";
import UserPresence from "../components/UserPresence";
import KeyboardShortcuts from "../components/KeyboardShortcuts";
import PollModal from "../components/PollModal";
import PollOverlay from "../components/PollOverlay";
import { pollAPI } from "../services/pollAPI";
import { Poll, CreatePollData, CastVoteData } from "../types/poll";
import { useToast } from "../context/ToastContext";
import socketService from "../services/socket";

const WhiteboardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentWhiteboard, getWhiteboard, updateWhiteboard, loading, error } =
    useWhiteboard();

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [whiteboardName, setWhiteboardName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [collaboratorManagerOpen, setCollaboratorManagerOpen] = useState(false);
  const [pollModalOpen, setPollModalOpen] = useState(false);
  const [activePolls, setActivePolls] = useState<Poll[]>([]);
  const [currentPoll, setCurrentPoll] = useState<Poll | null>(null);
  const { showToast } = useToast();

  // Initialize canvas hook
  const {
    containerRef,
    isReady,
    activeTool,
    setActiveTool,
    activeColor,
    setActiveColor,
    brushSize,
    setBrushSize,
    clearCanvas,
    saveCanvasAsJSON,
    loadCanvasFromJSON,
    exportCanvasAsImage,
    deleteSelectedObjects,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useCanvas({
    roomId: id || "",
    userId: user?._id || "",
    userName: user?.name || "",
    readOnly: false,
  });

  // Load whiteboard data
  useEffect(() => {
    if (id) {
      getWhiteboard(id);
    }
  }, [id, getWhiteboard]);

  // Update local state when whiteboard data is loaded
  useEffect(() => {
    if (currentWhiteboard) {
      setWhiteboardName(currentWhiteboard.name);
      setIsPublic(currentWhiteboard.isPublic);

      // Load canvas data if available
      if (currentWhiteboard.canvasData && isReady) {
        loadCanvasFromJSON(currentWhiteboard.canvasData);
      }
    }
  }, [currentWhiteboard, isReady, loadCanvasFromJSON]);

  // Handle save canvas
  const handleSaveCanvas = async () => {
    if (!currentWhiteboard || !id) return;

    try {
      const canvasData = saveCanvasAsJSON();
      await updateWhiteboard(id, { canvasData });

      setSnackbarMessage("Whiteboard saved successfully");
      setSnackbarOpen(true);
      setTimeout(() => setSnackbarOpen(false), 3000);
    } catch (error) {
      console.error("Failed to save whiteboard:", error);
      setSnackbarMessage("Failed to save whiteboard");
      setSnackbarOpen(true);
      setTimeout(() => setSnackbarOpen(false), 3000);
    }
  };

  // Handle export canvas
  const handleExportCanvas = () => {
    const dataUrl = exportCanvasAsImage();
    const link = document.createElement("a");
    link.download = `${whiteboardName || "whiteboard"}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle open save dialog
  const handleOpenSaveDialog = () => {
    setSaveDialogOpen(true);
  };

  // Handle close save dialog
  const handleCloseSaveDialog = () => {
    setSaveDialogOpen(false);
  };

  // Handle save whiteboard settings
  const handleSaveSettings = async () => {
    if (!id) return;

    try {
      await updateWhiteboard(id, {
        name: whiteboardName,
        isPublic,
      });

      setSaveDialogOpen(false);
      setSnackbarMessage("Whiteboard settings updated");
      setSnackbarOpen(true);
      setTimeout(() => setSnackbarOpen(false), 3000);
    } catch (error) {
      console.error("Failed to update whiteboard settings:", error);
    }
  };

  // Handle copy share link
  const handleCopyShareLink = () => {
    const shareUrl = `${window.location.origin}/whiteboard/${id}`;
    navigator.clipboard.writeText(shareUrl);

    setSnackbarMessage("Share link copied to clipboard");
    setSnackbarOpen(true);
    setTimeout(() => setSnackbarOpen(false), 3000);
  };

  // Handle back to dashboard
  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  // Handle chat toggle
  const handleChatToggle = () => {
    setChatOpen((prev) => !prev);
  };

  // Handle collaborator manager
  const handleOpenCollaboratorManager = () => {
    setCollaboratorManagerOpen(true);
  };

  const handleCloseCollaboratorManager = () => {
    setCollaboratorManagerOpen(false);
  };

  const handleCollaboratorUpdate = (updatedWhiteboard: any) => {
    // Update the current whiteboard in context
    // This would typically be handled by the whiteboard context
    setSnackbarMessage("Collaborators updated successfully");
    setSnackbarOpen(true);
    setTimeout(() => setSnackbarOpen(false), 3000);
  };

  // Load active polls and set up real-time updates
  useEffect(() => {
    if (!id) return;

    const loadActivePolls = async () => {
      try {
        const response = await pollAPI.getActivePolls(id);
        if (response.success) {
          setActivePolls(response.polls);
          // Show the first active poll if any
          if (response.polls.length > 0 && !currentPoll) {
            setCurrentPoll(response.polls[0]);
          }
        }
      } catch (error) {
        console.error("Failed to load active polls:", error);
      }
    };

    loadActivePolls();

    // Set up real-time poll event listeners
    const unsubscribePollCreated = socketService.onPollCreated((data) => {
      setActivePolls((prev) => [...prev, data.poll]);
      if (!currentPoll) {
        setCurrentPoll(data.poll);
      }
      showToast(`New poll created by ${data.createdBy}`, "info");
    });

    const unsubscribePollVoteCast = socketService.onPollVoteCast((data) => {
      // Refresh poll results when someone votes
      if (currentPoll && currentPoll._id === data.pollId) {
        loadActivePolls();
      }
    });

    const unsubscribePollClosed = socketService.onPollClosed((data) => {
      setActivePolls((prev) => prev.filter((poll) => poll._id !== data.pollId));
      if (currentPoll && currentPoll._id === data.pollId) {
        setCurrentPoll(null);
      }
      showToast(`Poll closed by ${data.closedBy}`, "info");
    });

    // Poll for updates every 30 seconds as backup
    const interval = setInterval(loadActivePolls, 30000);

    return () => {
      clearInterval(interval);
      unsubscribePollCreated();
      unsubscribePollVoteCast();
      unsubscribePollClosed();
    };
  }, [id, currentPoll, showToast]);

  // Poll handlers
  const handleCreatePoll = async (data: CreatePollData) => {
    try {
      const response = await pollAPI.createPoll(data);
      if (response.success) {
        setActivePolls((prev) => [...prev, response.poll]);
        setCurrentPoll(response.poll);
        showToast("Poll created successfully!", "success");

        // Notify other users via socket
        if (id) {
          socketService.sendPollCreated({ roomId: id, poll: response.poll });
        }
      }
    } catch (error: any) {
      showToast(error.message || "Failed to create poll", "error");
      throw error;
    }
  };

  const handleCastVote = async (voteData: CastVoteData) => {
    try {
      const response = await pollAPI.castVote(voteData);
      if (response.success) {
        showToast("Vote cast successfully!", "success");

        // Notify other users via socket
        if (id) {
          socketService.sendPollVoteCast({
            roomId: id,
            pollId: voteData.pollId,
          });
        }

        // Refresh active polls
        const pollsResponse = await pollAPI.getActivePolls(id!);
        if (pollsResponse.success) {
          setActivePolls(pollsResponse.polls);
        }
      }
    } catch (error: any) {
      showToast(error.message || "Failed to cast vote", "error");
      throw error;
    }
  };

  const handleClosePoll = () => {
    setCurrentPoll(null);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-500 mr-3"
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
            <span className="text-red-700">{error}</span>
          </div>
        </div>
        <button
          onClick={handleBackToDashboard}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span>Back to Dashboard</span>
        </button>
      </div>
    );
  }

  if (!currentWhiteboard) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-yellow-500 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <span className="text-yellow-700">Whiteboard not found</span>
          </div>
        </div>
        <button
          onClick={handleBackToDashboard}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span>Back to Dashboard</span>
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleBackToDashboard}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Back to Dashboard"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-gray-900">
            {whiteboardName}
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleSaveCanvas}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Save Whiteboard"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </button>

          <button
            onClick={handleCopyShareLink}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Share"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
              />
            </svg>
          </button>

          <button
            onClick={handleOpenCollaboratorManager}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Manage Collaborators"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
          </button>

          <button
            onClick={() => setPollModalOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Create Poll"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </button>

          <button
            onClick={handleOpenSaveDialog}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Whiteboard Settings"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Canvas Container */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden bg-gray-100"
      >
        <canvas id="canvas" />

        {/* Toolbar */}
        <WhiteboardToolbar
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          activeColor={activeColor}
          setActiveColor={setActiveColor}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          clearCanvas={clearCanvas}
          saveCanvas={handleSaveCanvas}
          exportCanvas={handleExportCanvas}
          deleteSelectedObjects={deleteSelectedObjects}
          undo={undo}
          redo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
        />

        {/* User Presence */}
        <UserPresence roomId={id || ""} />

        {/* Keyboard Shortcuts */}
        <KeyboardShortcuts />
      </div>

      {/* Settings Dialog */}
      {saveDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Whiteboard Settings
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="whiteboardName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Whiteboard Name
                </label>
                <input
                  id="whiteboardName"
                  type="text"
                  value={whiteboardName}
                  onChange={(e) => setWhiteboardName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Public Whiteboard:
                </label>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setIsPublic(true)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isPublic
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setIsPublic(false)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      !isPublic
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    No
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Public whiteboards can be accessed by anyone with the link.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCloseSaveDialog}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar for notifications */}
      {snackbarOpen && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {snackbarMessage}
        </div>
      )}

      {/* Collaborator Manager */}
      {collaboratorManagerOpen && currentWhiteboard && (
        <CollaboratorManager
          whiteboard={currentWhiteboard}
          onUpdate={handleCollaboratorUpdate}
          onClose={handleCloseCollaboratorManager}
        />
      )}

      {/* Poll Modal */}
      {pollModalOpen && id && (
        <PollModal
          isOpen={pollModalOpen}
          onClose={() => setPollModalOpen(false)}
          onCreatePoll={handleCreatePoll}
          whiteboardId={id}
        />
      )}

      {/* Poll Overlay */}
      {currentPoll && (
        <PollOverlay
          poll={currentPoll}
          onClose={handleClosePoll}
          onVote={handleCastVote}
        />
      )}

      {/* Chat Sidebar */}
      {id && user && (
        <ChatSidebar
          roomId={id}
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          onToggle={handleChatToggle}
        />
      )}
    </div>
  );
};

export default WhiteboardPage;

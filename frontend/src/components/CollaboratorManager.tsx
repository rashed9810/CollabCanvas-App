import React, { useState } from "react";
import { User, Whiteboard } from "../types";
import { useAuth } from "../context/AuthContext";
import { whiteboardAPI } from "../services/api";

interface CollaboratorManagerProps {
  whiteboard: Whiteboard;
  onUpdate: (updatedWhiteboard: Whiteboard) => void;
  onClose: () => void;
}

const CollaboratorManager: React.FC<CollaboratorManagerProps> = ({
  whiteboard,
  onUpdate,
  onClose,
}) => {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isOwner =
    typeof whiteboard.owner === "object"
      ? whiteboard.owner._id === user?._id
      : whiteboard.owner === user?._id;

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError("");

    try {
      // In a real app, you'd search for users by email first
      // For now, we'll assume the email is a user ID
      const updatedWhiteboard = await whiteboardAPI.addCollaborator(
        whiteboard._id,
        email.trim()
      );
      onUpdate(updatedWhiteboard);
      setEmail("");
    } catch (error: any) {
      setError(error.message || "Failed to add collaborator");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    try {
      const updatedWhiteboard = await whiteboardAPI.removeCollaborator(
        whiteboard._id,
        userId
      );
      onUpdate(updatedWhiteboard);
    } catch (error: any) {
      setError(error.message || "Failed to remove collaborator");
    }
  };

  const collaborators = Array.isArray(whiteboard.collaborators)
    ? whiteboard.collaborators
    : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Manage Collaborators
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {isOwner && (
          <form onSubmit={handleAddCollaborator} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Collaborator by Email
            </label>
            <div className="flex space-x-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Adding..." : "Add"}
              </button>
            </div>
          </form>
        )}

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Current Collaborators ({collaborators.length})
          </h3>

          {collaborators.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No collaborators yet. Add some to start collaborating!
            </p>
          ) : (
            <div className="space-y-2">
              {collaborators.map((collaborator) => {
                const collabUser =
                  typeof collaborator === "object" ? collaborator : null;
                const collabId =
                  typeof collaborator === "string"
                    ? collaborator
                    : collabUser?._id;
                const collabName = collabUser?.name || "Unknown User";
                const collabEmail = collabUser?.email || "";

                return (
                  <div
                    key={collabId}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{collabName}</p>
                      {collabEmail && (
                        <p className="text-sm text-gray-500">{collabEmail}</p>
                      )}
                    </div>
                    {isOwner && (
                      <button
                        onClick={() => handleRemoveCollaborator(collabId!)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Remove collaborator"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollaboratorManager;

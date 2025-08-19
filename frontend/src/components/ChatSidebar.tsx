import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import socketService from "../services/socket";

// Simple SVG Icons
const CloseIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
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
);

const SendIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 19.8V2.216a1 1 0 00-1.597.655l-2.363 5.625a1 1 0 00.309 1.165l4.236 3.389a1 1 0 01.309.915V21.4l6.188-3.869A1 1 0 0020 17v-8a1 1 0 00-1-1H3a1 1 0 01-1-1v-4a1 1 0 011-1h16a1 1 0 011 1v4a1 1 0 01-1 1h-13.5m-6.5 11l6-6m0 0l-6-6m6 6H3"
    />
  </svg>
);

const ChatIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 12h.01M12 12h.01M16 12h.01M12 16a4 4 0 100-8 4 4 0 0108z"
    />
  </svg>
);

interface ChatMessage {
  roomId: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
}

interface ChatSidebarProps {
  roomId: string;
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  roomId,
  isOpen,
  onClose,
  onToggle,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Listen for chat messages
  useEffect(() => {
    const handleChatMessage = (message: ChatMessage) => {
      if (message.roomId === roomId) {
        setMessages((prev) => [...prev, message]);

        // Increment unread count if chat is closed
        if (!isOpen && message.userId !== user?._id) {
          setUnreadCount((prev) => prev + 1);
        }
      }
    };

    const cleanup = socketService.onChatMessage(handleChatMessage);

    return () => {
      cleanup();
    };
  }, [roomId, isOpen, user?._id]);

  // Reset unread count when opening chat
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !user) return;

    const message: ChatMessage = {
      roomId,
      userId: user._id,
      userName: user.name,
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    socketService.sendChatMessage(message);
    setNewMessage("");
  };

  // Handle key down (Enter to send)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Render chat toggle button
  const renderChatToggle = () => {
    const baseClasses =
      "fixed bottom-5 right-5 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 focus:outline-none";
    const openButtonClasses = isOpen
      ? "bg-red-500 hover:bg-red-600"
      : "bg-purple-600 hover:bg-purple-700";

    return (
      <button
        onClick={onToggle}
        className={`${baseClasses} ${openButtonClasses} transition-all duration-300 transform hover:scale-105`}
        style={{
          right: isOpen ? "20px" : "20px",
          transition: "right 0.3s ease, transform 0.15s ease",
        }}
      >
        {isOpen ? (
          <CloseIcon className="w-6 h-6" />
        ) : (
          <div className="relative">
            <ChatIcon className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
        )}
      </button>
    );
  };

  // If not open, just show the toggle button
  if (!isOpen) {
    return renderChatToggle();
  }

  return (
    <>
      {renderChatToggle()}
      <div
        className="fixed top-16 right-0 bottom-0 w-80 flex flex-col z-50 shadow-2xl bg-white"
        style={{
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease",
        }}
      >
        {/* Header */}
        <div className="p-4 bg-indigo-600 text-white flex justify-between items-center rounded-t-lg">
          <h2 className="text-lg font-semibold">Chat</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 focus:outline-none"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No messages yet. Start the conversation!
            </p>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 ${
                    message.userId === user?._id ? "text-right" : ""
                  }`}
                >
                  <div
                    className={`p-3 rounded-2xl max-w-xs ${
                      message.userId === user?._id
                        ? "bg-indigo-100 rounded-tr-none"
                        : "bg-gray-100 rounded-tl-none"
                    }`}
                  >
                    <div className="flex items-center mb-1">
                      <span className="font-medium text-sm">
                        {message.userName}
                      </span>
                    </div>
                    <p className="text-gray-800">{message.text}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-gray-200 flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-indigo-600 text-white p-2 rounded-r-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatSidebar;

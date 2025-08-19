import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import socketService from "../services/socket";

interface ActiveUser {
  userId: string;
  userName: string;
  lastSeen: number;
}

interface UserPresenceProps {
  roomId: string;
}

const UserPresence: React.FC<UserPresenceProps> = ({ roomId }) => {
  const { user } = useAuth();
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);

  useEffect(() => {
    // Listen for user joined events
    const unsubscribeUserJoined = socketService.onUserJoined((data) => {
      setActiveUsers((prev) => {
        const existing = prev.find((u) => u.userId === data.userId);
        if (existing) {
          return prev.map((u) =>
            u.userId === data.userId ? { ...u, lastSeen: Date.now() } : u
          );
        }
        return [
          ...prev,
          {
            userId: data.userId,
            userName: data.userName,
            lastSeen: Date.now(),
          },
        ];
      });
    });

    // Listen for user left events
    const unsubscribeUserLeft = socketService.onUserLeft((data) => {
      setActiveUsers((prev) => prev.filter((u) => u.userId !== data.userId));
    });

    // Clean up inactive users periodically
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setActiveUsers(
        (prev) => prev.filter((u) => now - u.lastSeen < 30000) // Remove users inactive for 30 seconds
      );
    }, 10000);

    return () => {
      unsubscribeUserJoined();
      unsubscribeUserLeft();
      clearInterval(cleanupInterval);
    };
  }, [roomId]);

  // Generate consistent colors for users
  const getUserColor = (userId: string) => {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 50%)`;
  };

  // Filter out current user
  const otherUsers = activeUsers.filter((u) => u.userId !== user?._id);

  if (otherUsers.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-4 right-4 z-1000 flex items-center space-x-2 bg-white rounded-lg shadow-lg p-2">
      <span className="text-sm text-gray-600">Active:</span>
      <div className="flex -space-x-2">
        {otherUsers.slice(0, 5).map((activeUser) => (
          <div
            key={activeUser.userId}
            className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-medium"
            style={{ backgroundColor: getUserColor(activeUser.userId) }}
            title={activeUser.userName}
          >
            {activeUser.userName.charAt(0).toUpperCase()}
          </div>
        ))}
        {otherUsers.length > 5 && (
          <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-500 flex items-center justify-center text-white text-xs font-medium">
            +{otherUsers.length - 5}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPresence;

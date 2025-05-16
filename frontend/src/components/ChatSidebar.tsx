import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Divider,
  Avatar,
  Tooltip,
  Badge,
} from "@mui/material";
import { Send, Close, Chat } from "@mui/icons-material";
import socketService from "../services/socket";
import { useAuth } from "../context/AuthContext";

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
  const chatContainerRef = useRef<HTMLDivElement>(null);

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

  // Handle key press (Enter to send)
  const handleKeyPress = (e: React.KeyboardEvent) => {
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
  const renderChatToggle = () => (
    <Tooltip title={isOpen ? "Close Chat" : "Open Chat"}>
      <Badge color="error" badgeContent={unreadCount} max={99}>
        <IconButton
          onClick={onToggle}
          sx={{
            position: "fixed",
            bottom: "20px",
            right: isOpen ? "320px" : "20px",
            bgcolor: "primary.main",
            color: "white",
            "&:hover": {
              bgcolor: "primary.dark",
            },
            zIndex: 1000,
            transition: "right 0.3s ease",
          }}
        >
          {isOpen ? <Close /> : <Chat />}
        </IconButton>
      </Badge>
    </Tooltip>
  );

  // If not open, just show the toggle button
  if (!isOpen) {
    return renderChatToggle();
  }

  return (
    <>
      {renderChatToggle()}
      <Paper
        elevation={3}
        sx={{
          position: "fixed",
          top: "64px",
          right: 0,
          bottom: 0,
          width: "300px",
          display: "flex",
          flexDirection: "column",
          zIndex: 900,
          transition: "transform 0.3s ease",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            bgcolor: "primary.main",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">Chat</Typography>
          <IconButton onClick={onClose} sx={{ color: "white" }}>
            <Close />
          </IconButton>
        </Box>

        <Divider />

        {/* Messages */}
        <Box
          ref={chatContainerRef}
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {messages.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", mt: 2 }}
            >
              No messages yet. Start the conversation!
            </Typography>
          ) : (
            messages.map((message, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems:
                    message.userId === user?._id ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  alignSelf:
                    message.userId === user?._id ? "flex-end" : "flex-start",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 0.5,
                    gap: 1,
                    flexDirection:
                      message.userId === user?._id ? "row-reverse" : "row",
                  }}
                >
                  <Avatar
                    sx={{
                      width: 24,
                      height: 24,
                      fontSize: "0.75rem",
                      bgcolor:
                        message.userId === user?._id
                          ? "primary.main"
                          : "secondary.main",
                    }}
                  >
                    {message.userName.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="caption" color="text.secondary">
                    {message.userName}
                  </Typography>
                </Box>
                <Paper
                  sx={{
                    p: 1.5,
                    bgcolor:
                      message.userId === user?._id
                        ? "primary.light"
                        : "grey.100",
                    color:
                      message.userId === user?._id ? "white" : "text.primary",
                    borderRadius: 2,
                    maxWidth: "100%",
                    wordBreak: "break-word",
                  }}
                >
                  <Typography variant="body2">{message.text}</Typography>
                </Paper>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {formatTime(message.timestamp)}
                </Typography>
              </Box>
            ))
          )}
          <div ref={messagesEndRef} />
        </Box>

        <Divider />

        {/* Input */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            multiline
            maxRows={3}
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <Send />
          </IconButton>
        </Box>
      </Paper>
    </>
  );
};

export default ChatSidebar;

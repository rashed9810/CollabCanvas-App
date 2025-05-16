import { Server, Socket } from "socket.io";
import { verifyToken } from "../utils/jwt";
import User from "../models/User";
import Whiteboard from "../models/Whiteboard";

interface DrawData {
  roomId: string;
  userId: string;
  userName: string;
  objectData: any;
  action: "add" | "modify" | "remove";
}

interface CursorData {
  roomId: string;
  userId: string;
  userName: string;
  x: number;
  y: number;
}

export const setupSocketHandlers = (io: Server) => {
  // Middleware for authentication
  io.use(async (socket: Socket, next) => {
    try {
      // Get token from cookies (Socket.io can access cookies when withCredentials is true)
      const cookies = socket.request.headers.cookie;

      // Extract token from cookies
      let token = null;
      if (cookies) {
        const tokenCookie = cookies
          .split(";")
          .find((c) => c.trim().startsWith("token="));
        if (tokenCookie) {
          token = tokenCookie.split("=")[1];
        }
      }

      // If no token in cookies, try to get userId from auth
      const userId = socket.handshake.auth.userId;

      if (!token && !userId) {
        return next(
          new Error("Authentication error: No token or userId provided")
        );
      }

      let user;

      if (token) {
        // Verify token and get user
        const decoded = verifyToken(token);
        user = await User.findById(decoded.id).select("-password");
      } else if (userId) {
        // Get user by ID
        user = await User.findById(userId).select("-password");
      }

      if (!user) {
        return next(new Error("User not found"));
      }

      // Attach user to socket
      (socket as any).user = user;
      next();
    } catch (error) {
      console.error("Socket authentication error:", error);
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = (socket as any).user;
    console.log(`User connected: ${user.name} (${socket.id})`);

    // Join a whiteboard room
    socket.on("join-room", async (roomId: string) => {
      try {
        // Check if whiteboard exists and user has access
        const whiteboard = await Whiteboard.findById(roomId);

        if (!whiteboard) {
          socket.emit("error", { message: "Whiteboard not found" });
          return;
        }

        const isOwner = whiteboard.owner.toString() === user._id.toString();
        const isCollaborator = whiteboard.collaborators.some(
          (id) => id.toString() === user._id.toString()
        );

        if (!isOwner && !isCollaborator && !whiteboard.isPublic) {
          socket.emit("error", {
            message: "Not authorized to access this whiteboard",
          });
          return;
        }

        // Join the room
        socket.join(roomId);

        // Notify others in the room
        socket.to(roomId).emit("user-joined", {
          userId: user._id,
          userName: user.name,
        });

        console.log(`User ${user.name} joined room: ${roomId}`);

        // Send current canvas data to the user
        socket.emit("canvas-data", {
          canvasData: whiteboard.canvasData,
        });
      } catch (error) {
        console.error("Error joining room:", error);
        socket.emit("error", { message: "Failed to join whiteboard" });
      }
    });

    // Handle drawing events
    socket.on("draw", (data: DrawData) => {
      // Broadcast to others in the room
      socket.to(data.roomId).emit("draw", {
        ...data,
        userId: user._id,
        userName: user.name,
      });

      // Save to database (debounced on the server side)
      saveCanvasData(data.roomId, data.objectData);
    });

    // Handle cursor movement
    socket.on("cursor-move", (data: CursorData) => {
      socket.to(data.roomId).emit("cursor-move", {
        ...data,
        userId: user._id,
        userName: user.name,
      });
    });

    // Handle chat messages
    interface ChatMessage {
      roomId: string;
      text: string;
      userId?: string;
      userName?: string;
      timestamp?: string;
    }

    socket.on("chat-message", (data: ChatMessage) => {
      // Validate data
      if (!data.roomId || !data.text) {
        return socket.emit("error", { message: "Invalid chat message data" });
      }

      // Add user info if not provided
      const messageData = {
        ...data,
        userId: data.userId || user._id,
        userName: data.userName || user.name,
        timestamp: data.timestamp || new Date().toISOString(),
      };

      // Broadcast message to all clients in the room including sender
      io.to(data.roomId).emit("chat-message", messageData);

      // TODO: Store chat messages in database if needed
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${user.name} (${socket.id})`);

      // Notify all rooms this user was in
      const rooms = Array.from(socket.rooms);
      rooms.forEach((room) => {
        if (room !== socket.id) {
          socket.to(room).emit("user-left", {
            userId: user._id,
            userName: user.name,
          });
        }
      });
    });
  });
};

// Debounce save to database
const saveTimers: { [key: string]: NodeJS.Timeout } = {};

const saveCanvasData = (whiteboardId: string, canvasData: string) => {
  // Clear previous timer
  if (saveTimers[whiteboardId]) {
    clearTimeout(saveTimers[whiteboardId]);
  }

  // Set new timer (save after 2 seconds of inactivity)
  saveTimers[whiteboardId] = setTimeout(async () => {
    try {
      await Whiteboard.findByIdAndUpdate(whiteboardId, { canvasData });
      console.log(`Canvas data saved for whiteboard: ${whiteboardId}`);
    } catch (error) {
      console.error("Error saving canvas data:", error);
    }
  }, 2000);
};

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketHandlers = void 0;
const jwt_1 = require("../utils/jwt");
const User_1 = __importDefault(require("../models/User"));
const Whiteboard_1 = __importDefault(require("../models/Whiteboard"));
const setupSocketHandlers = (io) => {
    // Middleware for authentication
    io.use(async (socket, next) => {
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
                return next(new Error("Authentication error: No token or userId provided"));
            }
            let user;
            if (token) {
                // Verify token and get user
                const decoded = (0, jwt_1.verifyToken)(token);
                user = await User_1.default.findById(decoded.id).select("-password");
            }
            else if (userId) {
                // Get user by ID
                user = await User_1.default.findById(userId).select("-password");
            }
            if (!user) {
                return next(new Error("User not found"));
            }
            // Attach user to socket
            socket.user = user;
            next();
        }
        catch (error) {
            console.error("Socket authentication error:", error);
            next(new Error("Authentication error"));
        }
    });
    io.on("connection", (socket) => {
        const user = socket.user;
        console.log(`User connected: ${user.name} (${socket.id})`);
        // Join a whiteboard room
        socket.on("join-room", async (roomId) => {
            try {
                // Check if whiteboard exists and user has access
                const whiteboard = await Whiteboard_1.default.findById(roomId);
                if (!whiteboard) {
                    socket.emit("error", { message: "Whiteboard not found" });
                    return;
                }
                const isOwner = whiteboard.owner.toString() === user._id.toString();
                const isCollaborator = whiteboard.collaborators.some((id) => id.toString() === user._id.toString());
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
            }
            catch (error) {
                console.error("Error joining room:", error);
                socket.emit("error", { message: "Failed to join whiteboard" });
            }
        });
        // Handle drawing events
        socket.on("draw-event", (data) => {
            // Broadcast to others in the room
            socket.to(data.roomId).emit("draw-event", {
                ...data,
                userId: user._id,
                userName: user.name,
            });
            // Save to database (debounced on the server side)
            saveCanvasData(data.roomId, data.objectData);
        });
        // Handle cursor movement
        socket.on("cursor-position", (data) => {
            socket.to(data.roomId).emit("cursor-move", {
                ...data,
                userId: user._id,
                userName: user.name,
            });
        });
        socket.on("chat-message", (data) => {
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
        // Handle poll events
        socket.on("poll-created", (data) => {
            // Broadcast new poll to all users in the room
            socket.to(data.roomId).emit("poll-created", {
                poll: data.poll,
                createdBy: user.name,
            });
        });
        socket.on("poll-vote-cast", (data) => {
            // Broadcast vote update to all users in the room
            socket.to(data.roomId).emit("poll-vote-cast", {
                pollId: data.pollId,
                votedBy: user.name,
            });
        });
        socket.on("poll-closed", (data) => {
            // Broadcast poll closure to all users in the room
            socket.to(data.roomId).emit("poll-closed", {
                pollId: data.pollId,
                closedBy: user.name,
            });
        });
        // Poll created event
        socket.on("poll-created", (data) => {
            // Validate data
            if (!data.roomId || !data.poll) {
                return socket.emit("error", { message: "Invalid poll data" });
            }
            // Broadcast poll creation to all clients in the room
            socket.to(data.roomId).emit("poll-created", {
                poll: data.poll,
                createdBy: {
                    userId: user._id,
                    userName: user.name,
                },
            });
            console.log(`Poll created in room ${data.roomId} by ${user.name}`);
        });
        // Vote cast event
        socket.on("vote-cast", (data) => {
            // Validate data
            if (!data.roomId || !data.pollId || data.optionIndex === undefined) {
                return socket.emit("error", { message: "Invalid vote data" });
            }
            // Broadcast vote to all clients in the room (excluding sender)
            socket.to(data.roomId).emit("vote-cast", {
                pollId: data.pollId,
                optionIndex: data.optionIndex,
                userId: user._id,
                userName: user.name,
                timestamp: new Date().toISOString(),
            });
            console.log(`Vote cast in room ${data.roomId} by ${user.name} for poll ${data.pollId}`);
        });
        // Poll results updated event
        socket.on("poll-results-updated", (data) => {
            // Validate data
            if (!data.roomId || !data.pollId || !data.results) {
                return socket.emit("error", { message: "Invalid poll results data" });
            }
            // Broadcast updated results to all clients in the room
            io.to(data.roomId).emit("poll-results-updated", {
                pollId: data.pollId,
                results: data.results,
                totalVotes: data.totalVotes,
                timestamp: new Date().toISOString(),
            });
            console.log(`Poll results updated for poll ${data.pollId} in room ${data.roomId}`);
        });
        // Poll closed event
        socket.on("poll-closed", (data) => {
            // Validate data
            if (!data.roomId || !data.pollId) {
                return socket.emit("error", { message: "Invalid poll close data" });
            }
            // Broadcast poll closure to all clients in the room
            io.to(data.roomId).emit("poll-closed", {
                pollId: data.pollId,
                closedBy: {
                    userId: user._id,
                    userName: user.name,
                },
                timestamp: new Date().toISOString(),
            });
            console.log(`Poll ${data.pollId} closed in room ${data.roomId} by ${user.name}`);
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
exports.setupSocketHandlers = setupSocketHandlers;
// Debounce save to database
const saveTimers = {};
const saveCanvasData = (whiteboardId, canvasData) => {
    // Clear previous timer
    if (saveTimers[whiteboardId]) {
        clearTimeout(saveTimers[whiteboardId]);
    }
    // Set new timer (save after 2 seconds of inactivity)
    saveTimers[whiteboardId] = setTimeout(async () => {
        try {
            await Whiteboard_1.default.findByIdAndUpdate(whiteboardId, { canvasData });
            console.log(`Canvas data saved for whiteboard: ${whiteboardId}`);
        }
        catch (error) {
            console.error("Error saving canvas data:", error);
        }
    }, 2000);
};

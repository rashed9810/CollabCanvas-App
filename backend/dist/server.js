"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const whiteboardRoutes_1 = __importDefault(require("./routes/whiteboardRoutes"));
const socketService_1 = require("./services/socketService");
// Load environment variables
dotenv_1.default.config();
// Create Express app
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// Define allowed origins
const allowedOrigins = process.env.NODE_ENV === "production"
    ? [process.env.FRONTEND_URL || "https://your-production-domain.com"]
    : [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:3002",
    ];
// Configure Socket.io
const io = new socket_io_1.Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        credentials: true,
    },
});
// Middleware
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, etc.)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    optionsSuccessStatus: 200,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Connect to MongoDB
const connectDB = async () => {
    try {
        const conn = await mongoose_1.default.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/whiteboard-app");
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error: ${error.message}`);
        }
        else {
            console.error("An unknown error occurred");
        }
        process.exit(1);
    }
};
// Routes
app.get("/", (req, res) => {
    res.send("API is running...");
});
// API Routes
app.use("/api/users", userRoutes_1.default);
app.use("/api/whiteboards", whiteboardRoutes_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: process.env.NODE_ENV === "production" ? "Server error" : err.message,
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
});
// Setup Socket.io handlers
(0, socketService_1.setupSocketHandlers)(io);
// Start server
const PORT = process.env.PORT || 5001;
connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
    server.on("error", (error) => {
        if (error.code === "EADDRINUSE") {
            console.error(`Port ${PORT} is already in use. Please use a different port.`);
            process.exit(1);
        }
        else {
            console.error("Server error:", error);
            process.exit(1);
        }
    });
});

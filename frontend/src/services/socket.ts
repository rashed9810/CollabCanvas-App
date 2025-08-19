import { io, Socket } from "socket.io-client";
import { DrawEvent, CursorPosition } from "../types";

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;

  // Initialize socket connection
  connect(token: string): void {
    if (this.socket) {
      this.disconnect();
    }

    this.token = token;
    this.socket = io(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000",
      {
        auth: { token },
        withCredentials: true,
      }
    );

    this.socket.on("connect", () => {
      console.log("Socket connected");
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
  }

  // Disconnect socket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Join a whiteboard room
  joinRoom(roomId: string): void {
    if (!this.socket) {
      console.error("Socket not connected");
      return;
    }

    this.socket.emit("join-room", roomId);
  }

  // Send drawing event
  sendDrawEvent(data: DrawEvent): void {
    if (!this.socket) {
      console.error("Socket not connected");
      return;
    }

    this.socket.emit("draw-event", data);
  }

  // Send cursor position
  sendCursorPosition(
    data: Omit<CursorPosition, "userId" | "userName"> & { roomId: string }
  ): void {
    if (!this.socket) {
      console.error("Socket not connected");
      return;
    }

    this.socket.emit("cursor-position", data);
  }

  // Listen for drawing events
  onDrawEvent(callback: (data: DrawEvent) => void): () => void {
    if (!this.socket) {
      console.error("Socket not connected");
      return () => {};
    }

    this.socket.on("draw-event", callback);
    return () => {
      this.socket?.off("draw-event", callback);
    };
  }

  // Listen for cursor movements
  onCursorMove(callback: (data: CursorPosition) => void): () => void {
    if (!this.socket) {
      console.error("Socket not connected");
      return () => {};
    }

    this.socket.on("cursor-move", callback);
    return () => {
      this.socket?.off("cursor-move", callback);
    };
  }

  // Listen for user joined events
  onUserJoined(
    callback: (data: { userId: string; userName: string }) => void
  ): () => void {
    if (!this.socket) {
      console.error("Socket not connected");
      return () => {};
    }

    this.socket.on("user-joined", callback);
    return () => {
      this.socket?.off("user-joined", callback);
    };
  }

  // Listen for user left events
  onUserLeft(
    callback: (data: { userId: string; userName: string }) => void
  ): () => void {
    if (!this.socket) {
      console.error("Socket not connected");
      return () => {};
    }

    this.socket.on("user-left", callback);
    return () => {
      this.socket?.off("user-left", callback);
    };
  }

  // Listen for canvas data
  onCanvasData(callback: (data: { canvasData: string }) => void): () => void {
    if (!this.socket) {
      console.error("Socket not connected");
      return () => {};
    }

    this.socket.on("canvas-data", callback);
    return () => {
      this.socket?.off("canvas-data", callback);
    };
  }

  // Listen for errors
  onError(callback: (data: { message: string }) => void): () => void {
    if (!this.socket) {
      console.error("Socket not connected");
      return () => {};
    }

    this.socket.on("error", callback);
    return () => {
      this.socket?.off("error", callback);
    };
  }

  // Send chat message
  sendChatMessage(data: {
    roomId: string;
    userId: string;
    userName: string;
    text: string;
    timestamp: string;
  }): void {
    if (!this.socket) {
      console.error("Socket not connected");
      return;
    }

    this.socket.emit("chat-message", data);
  }

  // Listen for chat messages
  onChatMessage(
    callback: (data: {
      roomId: string;
      userId: string;
      userName: string;
      text: string;
      timestamp: string;
    }) => void
  ): () => void {
    if (!this.socket) {
      console.error("Socket not connected");
      return () => {};
    }

    this.socket.on("chat-message", callback);
    return () => {
      this.socket?.off("chat-message", callback);
    };
  }

  // Send poll created event
  sendPollCreated(data: { roomId: string; poll: any }): void {
    if (!this.socket) {
      console.error("Socket not connected");
      return;
    }

    this.socket.emit("poll-created", data);
  }

  // Send poll vote cast event
  sendPollVoteCast(data: { roomId: string; pollId: string }): void {
    if (!this.socket) {
      console.error("Socket not connected");
      return;
    }

    this.socket.emit("poll-vote-cast", data);
  }

  // Send poll closed event
  sendPollClosed(data: { roomId: string; pollId: string }): void {
    if (!this.socket) {
      console.error("Socket not connected");
      return;
    }

    this.socket.emit("poll-closed", data);
  }

  // Listen for poll created events
  onPollCreated(
    callback: (data: { poll: any; createdBy: string }) => void
  ): () => void {
    if (!this.socket) {
      console.error("Socket not connected");
      return () => {};
    }

    this.socket.on("poll-created", callback);
    return () => {
      this.socket?.off("poll-created", callback);
    };
  }

  // Listen for poll vote cast events
  onPollVoteCast(
    callback: (data: { pollId: string; votedBy: string }) => void
  ): () => void {
    if (!this.socket) {
      console.error("Socket not connected");
      return () => {};
    }

    this.socket.on("poll-vote-cast", callback);
    return () => {
      this.socket?.off("poll-vote-cast", callback);
    };
  }

  // Listen for poll closed events
  onPollClosed(
    callback: (data: { pollId: string; closedBy: string }) => void
  ): () => void {
    if (!this.socket) {
      console.error("Socket not connected");
      return () => {};
    }

    this.socket.on("poll-closed", callback);
    return () => {
      this.socket?.off("poll-closed", callback);
    };
  }

  // Check if socket is connected
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;

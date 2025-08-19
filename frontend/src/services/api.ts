import axios from "axios";
import { User, Whiteboard } from "../types";

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auth API
export const authAPI = {
  register: async (
    name: string,
    email: string,
    password: string
  ): Promise<User> => {
    const response = await api.post("/users", { name, email, password });
    return response.data;
  },

  login: async (email: string, password: string): Promise<User> => {
    const response = await api.post("/users/login", { email, password });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post("/users/logout");
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get("/users/profile");
    return response.data;
  },
};

// Whiteboard API
export const whiteboardAPI = {
  getWhiteboards: async (): Promise<Whiteboard[]> => {
    const response = await api.get("/whiteboards");
    return response.data;
  },

  getWhiteboard: async (id: string): Promise<Whiteboard> => {
    const response = await api.get(`/whiteboards/${id}`);
    return response.data;
  },

  createWhiteboard: async (
    name: string,
    isPublic: boolean
  ): Promise<Whiteboard> => {
    const response = await api.post("/whiteboards", { name, isPublic });
    return response.data;
  },

  updateWhiteboard: async (
    id: string,
    data: Partial<Whiteboard>
  ): Promise<Whiteboard> => {
    const response = await api.put(`/whiteboards/${id}`, data);
    return response.data;
  },

  deleteWhiteboard: async (id: string): Promise<void> => {
    await api.delete(`/whiteboards/${id}`);
  },

  addCollaborator: async (
    whiteboardId: string,
    userId: string
  ): Promise<Whiteboard> => {
    const response = await api.post(
      `/whiteboards/${whiteboardId}/collaborators`,
      { userId }
    );
    return response.data;
  },

  removeCollaborator: async (
    whiteboardId: string,
    userId: string
  ): Promise<Whiteboard> => {
    const response = await api.delete(
      `/whiteboards/${whiteboardId}/collaborators/${userId}`
    );
    return response.data;
  },
};

// Add request interceptor for CSRF protection if needed
api.interceptors.request.use(
  (config) => {
    // No need to add token manually as we're using HTTP-only cookies
    // The browser will automatically include the cookie with each request

    // Add CSRF token if needed in the future
    // const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    // if (csrfToken) {
    //   config.headers['X-CSRF-Token'] = csrfToken;
    // }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log detailed error information for debugging (only in development)
    if (import.meta.env.DEV) {
      console.error("API Error Details:", {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        method: error.config?.method,
        data: error.response?.data,
      });
    }

    // Custom handling for resource exhaustion
    if (
      error.message?.includes("ERR_INSUFFICIENT_RESOURCES") ||
      error.code === "ERR_INSUFFICIENT_RESOURCES"
    ) {
      console.error("System resource exhaustion detected");
      return Promise.reject(
        new Error(
          "System resources are low. Please close unused applications and try again."
        )
      );
    }

    // Handle network errors
    if (error.code === "ERR_NETWORK") {
      return Promise.reject(
        new Error(
          "Network connection failed. Please check your internet connection."
        )
      );
    }

    // Handle timeout errors
    if (error.code === "ECONNABORTED") {
      return Promise.reject(new Error("Request timed out. Please try again."));
    }

    // For API errors, use the server's error message
    if (error.response?.data?.message) {
      return Promise.reject(new Error(error.response.data.message));
    }

    // Default error message
    return Promise.reject(
      new Error(error.message || "An unexpected error occurred")
    );
  }
);

export default api;

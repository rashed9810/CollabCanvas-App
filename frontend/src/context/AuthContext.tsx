import React, { createContext, useContext, useReducer, useEffect } from "react";
import { AuthState, AuthContextType, User } from "../types";
import { authAPI } from "../services/api";
import socketService from "../services/socket";

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Action types
type AuthAction =
  | { type: "LOGIN_SUCCESS"; payload: User }
  | { type: "REGISTER_SUCCESS"; payload: User }
  | { type: "AUTH_ERROR"; payload: string }
  | { type: "LOGOUT" }
  | { type: "CLEAR_ERROR" }
  | { type: "SET_LOADING"; payload: boolean };

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
    case "REGISTER_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case "AUTH_ERROR":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await authAPI.getProfile();
        dispatch({ type: "LOGIN_SUCCESS", payload: user });

        // Connect socket with user ID for authentication
        // The backend will validate the user via the HTTP-only cookie
        socketService.connect(user._id);
      } catch (error) {
        dispatch({
          type: "AUTH_ERROR",
          payload: "Session expired. Please login again.",
        });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    loadUser();

    // Cleanup
    return () => {
      socketService.disconnect();
    };
  }, []);

  // Login user
  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "CLEAR_ERROR" });

      const user = await authAPI.login(email, password);
      dispatch({ type: "LOGIN_SUCCESS", payload: user });

      // Connect socket with user ID
      // The backend handles token via HTTP-only cookie
      socketService.connect(user._id);
    } catch (error: any) {
      const message = error.message || "Login failed";
      dispatch({ type: "AUTH_ERROR", payload: message });
      throw error; // Re-throw to allow component-level handling if needed
    }
  };

  // Register user
  const register = async (name: string, email: string, password: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "CLEAR_ERROR" });

      const user = await authAPI.register(name, email, password);
      dispatch({ type: "REGISTER_SUCCESS", payload: user });

      // Connect socket with user ID
      // The backend handles token via HTTP-only cookie
      socketService.connect(user._id);
    } catch (error: any) {
      const message = error.message || "Registration failed";
      dispatch({ type: "AUTH_ERROR", payload: message });
      throw error; // Re-throw to allow component-level handling if needed
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await authAPI.logout();
      socketService.disconnect();
      dispatch({ type: "LOGOUT" });
    } catch (error: any) {
      console.error("Logout error:", error);
      // Still logout the user on the client side even if the API call fails
      dispatch({ type: "LOGOUT" });
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

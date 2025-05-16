import React, { createContext, useContext, useReducer } from 'react';
import { WhiteboardState, WhiteboardContextType, Whiteboard } from '../types';
import { whiteboardAPI } from '../services/api';

// Initial state
const initialState: WhiteboardState = {
  whiteboards: [],
  currentWhiteboard: null,
  loading: false,
  error: null,
};

// Action types
type WhiteboardAction =
  | { type: 'GET_WHITEBOARDS_SUCCESS'; payload: Whiteboard[] }
  | { type: 'GET_WHITEBOARD_SUCCESS'; payload: Whiteboard }
  | { type: 'CREATE_WHITEBOARD_SUCCESS'; payload: Whiteboard }
  | { type: 'UPDATE_WHITEBOARD_SUCCESS'; payload: Whiteboard }
  | { type: 'DELETE_WHITEBOARD_SUCCESS'; payload: string }
  | { type: 'WHITEBOARD_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

// Reducer
const whiteboardReducer = (state: WhiteboardState, action: WhiteboardAction): WhiteboardState => {
  switch (action.type) {
    case 'GET_WHITEBOARDS_SUCCESS':
      return {
        ...state,
        whiteboards: action.payload,
        loading: false,
        error: null,
      };
    case 'GET_WHITEBOARD_SUCCESS':
      return {
        ...state,
        currentWhiteboard: action.payload,
        loading: false,
        error: null,
      };
    case 'CREATE_WHITEBOARD_SUCCESS':
      return {
        ...state,
        whiteboards: [...state.whiteboards, action.payload],
        currentWhiteboard: action.payload,
        loading: false,
        error: null,
      };
    case 'UPDATE_WHITEBOARD_SUCCESS':
      return {
        ...state,
        whiteboards: state.whiteboards.map((wb) =>
          wb._id === action.payload._id ? action.payload : wb
        ),
        currentWhiteboard:
          state.currentWhiteboard?._id === action.payload._id
            ? action.payload
            : state.currentWhiteboard,
        loading: false,
        error: null,
      };
    case 'DELETE_WHITEBOARD_SUCCESS':
      return {
        ...state,
        whiteboards: state.whiteboards.filter((wb) => wb._id !== action.payload),
        currentWhiteboard:
          state.currentWhiteboard?._id === action.payload ? null : state.currentWhiteboard,
        loading: false,
        error: null,
      };
    case 'WHITEBOARD_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

// Create context
const WhiteboardContext = createContext<WhiteboardContextType | undefined>(undefined);

// Provider component
export const WhiteboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(whiteboardReducer, initialState);

  // Get all whiteboards
  const getWhiteboards = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const whiteboards = await whiteboardAPI.getWhiteboards();
      dispatch({ type: 'GET_WHITEBOARDS_SUCCESS', payload: whiteboards });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch whiteboards';
      dispatch({ type: 'WHITEBOARD_ERROR', payload: message });
    }
  };

  // Get whiteboard by ID
  const getWhiteboard = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const whiteboard = await whiteboardAPI.getWhiteboard(id);
      dispatch({ type: 'GET_WHITEBOARD_SUCCESS', payload: whiteboard });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch whiteboard';
      dispatch({ type: 'WHITEBOARD_ERROR', payload: message });
    }
  };

  // Create new whiteboard
  const createWhiteboard = async (name: string, isPublic: boolean) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const whiteboard = await whiteboardAPI.createWhiteboard(name, isPublic);
      dispatch({ type: 'CREATE_WHITEBOARD_SUCCESS', payload: whiteboard });
      return whiteboard;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create whiteboard';
      dispatch({ type: 'WHITEBOARD_ERROR', payload: message });
      throw error;
    }
  };

  // Update whiteboard
  const updateWhiteboard = async (id: string, data: Partial<Whiteboard>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const whiteboard = await whiteboardAPI.updateWhiteboard(id, data);
      dispatch({ type: 'UPDATE_WHITEBOARD_SUCCESS', payload: whiteboard });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update whiteboard';
      dispatch({ type: 'WHITEBOARD_ERROR', payload: message });
    }
  };

  // Delete whiteboard
  const deleteWhiteboard = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await whiteboardAPI.deleteWhiteboard(id);
      dispatch({ type: 'DELETE_WHITEBOARD_SUCCESS', payload: id });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete whiteboard';
      dispatch({ type: 'WHITEBOARD_ERROR', payload: message });
    }
  };

  // Add collaborator
  const addCollaborator = async (whiteboardId: string, userId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const whiteboard = await whiteboardAPI.addCollaborator(whiteboardId, userId);
      dispatch({ type: 'UPDATE_WHITEBOARD_SUCCESS', payload: whiteboard });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to add collaborator';
      dispatch({ type: 'WHITEBOARD_ERROR', payload: message });
    }
  };

  // Remove collaborator
  const removeCollaborator = async (whiteboardId: string, userId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const whiteboard = await whiteboardAPI.removeCollaborator(whiteboardId, userId);
      dispatch({ type: 'UPDATE_WHITEBOARD_SUCCESS', payload: whiteboard });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to remove collaborator';
      dispatch({ type: 'WHITEBOARD_ERROR', payload: message });
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <WhiteboardContext.Provider
      value={{
        ...state,
        getWhiteboards,
        getWhiteboard,
        createWhiteboard,
        updateWhiteboard,
        deleteWhiteboard,
        addCollaborator,
        removeCollaborator,
        clearError,
      }}
    >
      {children}
    </WhiteboardContext.Provider>
  );
};

// Custom hook to use whiteboard context
export const useWhiteboard = (): WhiteboardContextType => {
  const context = useContext(WhiteboardContext);
  if (context === undefined) {
    throw new Error('useWhiteboard must be used within a WhiteboardProvider');
  }
  return context;
};

// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

// Whiteboard types
export interface Whiteboard {
  _id: string;
  name: string;
  owner: User | string;
  collaborators: User[] | string[];
  canvasData: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

// Canvas object types
export interface CanvasObject {
  id: string;
  type: "rect" | "circle" | "path" | "text" | "image";
  left: number;
  top: number;
  width?: number;
  height?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  path?: any[];
  src?: string;
}

// Drawing event types
export interface DrawEvent {
  roomId: string;
  userId: string;
  userName: string;
  objectData: any;
  action: "add" | "modify" | "remove";
}

// Cursor position type
export interface CursorPosition {
  userId: string;
  userName: string;
  x: number;
  y: number;
}

// Auth context types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Whiteboard context types
export interface WhiteboardState {
  whiteboards: Whiteboard[];
  currentWhiteboard: Whiteboard | null;
  loading: boolean;
  error: string | null;
  lastFetchTime?: number; // Track last fetch time to prevent excessive requests
}

export interface WhiteboardContextType extends WhiteboardState {
  getWhiteboards: () => Promise<void>;
  getWhiteboard: (id: string) => Promise<void>;
  createWhiteboard: (name: string, isPublic: boolean) => Promise<Whiteboard>;
  updateWhiteboard: (id: string, data: Partial<Whiteboard>) => Promise<void>;
  deleteWhiteboard: (id: string) => Promise<void>;
  addCollaborator: (whiteboardId: string, userId: string) => Promise<void>;
  removeCollaborator: (whiteboardId: string, userId: string) => Promise<void>;
  clearError: () => void;
}

import { useEffect, useRef, useState, useCallback } from "react";
import { fabric } from "fabric-pure-browser";
import socketService from "../services/socket";
import { DrawEvent, CursorPosition } from "../types";

interface UseCanvasProps {
  roomId: string;
  userId: string;
  userName: string;
  readOnly?: boolean;
}

interface ActiveCursor {
  userId: string;
  userName: string;
  element: fabric.Object;
  lastActive: number;
}

// Define history state interface
interface CanvasHistoryState {
  canvasState: string;
  timestamp: number;
}

const useCanvas = ({
  roomId,
  userId,
  userName,
  readOnly = false,
}: UseCanvasProps) => {
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [activeTool, setActiveTool] = useState<
    "select" | "pen" | "rect" | "circle" | "text"
  >("select");
  const [activeColor, setActiveColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [activeCursors, setActiveCursors] = useState<ActiveCursor[]>([]);
  const cursorCleanupTimerRef = useRef<NodeJS.Timeout | null>(null);

  // History state for undo/redo
  const [history, setHistory] = useState<CanvasHistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [canSaveToHistory, setCanSaveToHistory] = useState(true);
  const historyLimitRef = useRef(30); // Maximum number of history states to keep

  // Save current canvas state to history
  const saveToHistory = useCallback(() => {
    if (!canvasRef.current || !canSaveToHistory) return;

    const canvas = canvasRef.current;
    const currentState = JSON.stringify(canvas.toJSON(["data"]));

    // If we're not at the end of the history, remove future states
    if (historyIndex < history.length - 1) {
      setHistory((prev) => prev.slice(0, historyIndex + 1));
    }

    // Add new state to history
    setHistory((prev) => {
      const newHistory = [
        ...prev,
        { canvasState: currentState, timestamp: Date.now() },
      ];

      // Limit history size
      if (newHistory.length > historyLimitRef.current) {
        return newHistory.slice(newHistory.length - historyLimitRef.current);
      }

      return newHistory;
    });

    setHistoryIndex((prev) => {
      const newIndex = prev + 1;
      return newIndex >= historyLimitRef.current
        ? historyLimitRef.current - 1
        : newIndex;
    });
  }, [canSaveToHistory, history, historyIndex]);

  // Initialize canvas
  useEffect(() => {
    if (!containerRef.current) return;

    // Create canvas
    const canvas = new fabric.Canvas("canvas", {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      backgroundColor: "#ffffff",
      isDrawingMode: false,
    });

    // Set up free drawing brush
    canvas.freeDrawingBrush.color = activeColor;
    canvas.freeDrawingBrush.width = brushSize;

    // Store canvas reference
    canvasRef.current = canvas;
    setIsReady(true);

    // Handle window resize
    const handleResize = () => {
      if (containerRef.current && canvas) {
        canvas.setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    // Join room
    socketService.joinRoom(roomId);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.dispose();
      if (cursorCleanupTimerRef.current) {
        clearInterval(cursorCleanupTimerRef.current);
      }
    };
  }, [roomId]);

  // Handle active tool change
  useEffect(() => {
    if (!canvasRef.current || !isReady) return;

    const canvas = canvasRef.current;

    // Set drawing mode based on active tool
    canvas.isDrawingMode = activeTool === "pen";

    // Disable selection in drawing mode
    canvas.selection = activeTool === "select";

    // Set cursor based on tool
    switch (activeTool) {
      case "select":
        canvas.defaultCursor = "default";
        break;
      case "pen":
        canvas.defaultCursor = "crosshair";
        break;
      case "rect":
      case "circle":
      case "text":
        canvas.defaultCursor = "crosshair";
        break;
      default:
        canvas.defaultCursor = "default";
    }
  }, [activeTool, isReady]);

  // Handle color and brush size changes
  useEffect(() => {
    if (!canvasRef.current || !isReady) return;

    const canvas = canvasRef.current;
    canvas.freeDrawingBrush.color = activeColor;
    canvas.freeDrawingBrush.width = brushSize;
  }, [activeColor, brushSize, isReady]);

  // Set up socket event listeners
  useEffect(() => {
    if (!isReady) return;

    // Handle drawing events from other users
    const unsubscribeDraw = socketService.onDrawEvent((data: DrawEvent) => {
      if (data.userId === userId) return; // Ignore own events

      const canvas = canvasRef.current;
      if (!canvas) return;

      try {
        if (data.action === "add" || data.action === "modify") {
          // Parse object data
          const objectData = JSON.parse(data.objectData);

          // Find existing object if modifying
          let existingObject: fabric.Object | undefined;
          if (data.action === "modify") {
            existingObject = canvas
              .getObjects()
              .find((obj) => obj.data?.id === objectData.id);
          }

          if (existingObject) {
            // Update existing object
            fabric.util.enlivenObjects([objectData], (enlivenedObjects) => {
              const newObject = enlivenedObjects[0];
              existingObject?.set(newObject.toObject());
              canvas.renderAll();
            });
          } else {
            // Add new object
            fabric.util.enlivenObjects([objectData], (enlivenedObjects) => {
              const newObject = enlivenedObjects[0];
              newObject.data = { id: objectData.id };
              canvas.add(newObject);
              canvas.renderAll();
            });
          }
        } else if (data.action === "remove") {
          // Remove object
          const objectToRemove = canvas
            .getObjects()
            .find((obj) => obj.data?.id === data.objectData);
          if (objectToRemove) {
            canvas.remove(objectToRemove);
            canvas.renderAll();
          }
        }
      } catch (error) {
        console.error("Error processing draw event:", error);
      }
    });

    // Handle cursor movements from other users
    const unsubscribeCursor = socketService.onCursorMove(
      (data: CursorPosition) => {
        if (data.userId === userId) return; // Ignore own cursor

        const canvas = canvasRef.current;
        if (!canvas) return;

        // Find existing cursor or create new one
        let cursorObj = activeCursors.find((c) => c.userId === data.userId);

        if (cursorObj) {
          // Update existing cursor
          cursorObj.element.set({
            left: data.x,
            top: data.y,
          });
          cursorObj.lastActive = Date.now();
          canvas.renderAll();
        } else {
          // Create new cursor
          const cursorElement = new fabric.Group(
            [
              new fabric.Triangle({
                width: 10,
                height: 10,
                fill: getRandomColor(data.userId),
                left: 0,
                top: 0,
                angle: 45,
              }),
              new fabric.Text(data.userName, {
                fontSize: 12,
                fill: "#000000",
                left: 10,
                top: -5,
                fontFamily: "Arial",
              }),
            ],
            {
              left: data.x,
              top: data.y,
              selectable: false,
              evented: false,
            }
          );

          canvas.add(cursorElement);

          setActiveCursors((prev) => [
            ...prev,
            {
              userId: data.userId,
              userName: data.userName,
              element: cursorElement,
              lastActive: Date.now(),
            },
          ]);
        }
      }
    );

    // Handle canvas data
    const unsubscribeCanvasData = socketService.onCanvasData((data) => {
      if (!data.canvasData) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      try {
        canvas.clear();
        canvas.loadFromJSON(data.canvasData, () => {
          canvas.renderAll();
        });
      } catch (error) {
        console.error("Error loading canvas data:", error);
      }
    });

    // Set up cursor cleanup timer
    cursorCleanupTimerRef.current = setInterval(() => {
      const now = Date.now();
      const canvas = canvasRef.current;
      if (!canvas) return;

      setActiveCursors((prev) => {
        const newCursors = prev.filter((cursor) => {
          // Remove cursors inactive for more than 5 seconds
          if (now - cursor.lastActive > 5000) {
            canvas.remove(cursor.element);
            return false;
          }
          return true;
        });

        if (newCursors.length !== prev.length) {
          canvas.renderAll();
        }

        return newCursors;
      });
    }, 1000);

    // Cleanup
    return () => {
      unsubscribeDraw();
      unsubscribeCursor();
      unsubscribeCanvasData();
    };
  }, [isReady, userId, activeCursors]);

  // Set up canvas event listeners
  useEffect(() => {
    if (!canvasRef.current || !isReady || readOnly) return;

    const canvas = canvasRef.current;
    let isDrawing = false;
    let startPoint: { x: number; y: number } | null = null;
    let newObject: fabric.Object | null = null;

    // Mouse down handler
    const handleMouseDown = (options: fabric.IEvent) => {
      if (activeTool === "select") return;

      isDrawing = true;
      startPoint = canvas.getPointer(options.e);

      // Create different objects based on active tool
      if (activeTool === "rect") {
        newObject = new fabric.Rect({
          left: startPoint.x,
          top: startPoint.y,
          width: 0,
          height: 0,
          fill: "transparent",
          stroke: activeColor,
          strokeWidth: brushSize,
          selectable: true,
          data: { id: generateId() },
        });
        canvas.add(newObject);
      } else if (activeTool === "circle") {
        newObject = new fabric.Circle({
          left: startPoint.x,
          top: startPoint.y,
          radius: 0,
          fill: "transparent",
          stroke: activeColor,
          strokeWidth: brushSize,
          selectable: true,
          data: { id: generateId() },
        });
        canvas.add(newObject);
      } else if (activeTool === "text") {
        newObject = new fabric.IText("Text", {
          left: startPoint.x,
          top: startPoint.y,
          fontFamily: "Arial",
          fontSize: brushSize * 3,
          fill: activeColor,
          selectable: true,
          data: { id: generateId() },
        });
        canvas.add(newObject);
        canvas.setActiveObject(newObject);
        isDrawing = false; // End drawing for text
      }
    };

    // Mouse move handler
    const handleMouseMove = (options: fabric.IEvent) => {
      if (!isDrawing || !startPoint || !newObject) return;

      const pointer = canvas.getPointer(options.e);

      if (activeTool === "rect") {
        const width = pointer.x - startPoint.x;
        const height = pointer.y - startPoint.y;

        if (width > 0) {
          newObject.set({ width });
        } else {
          newObject.set({ left: pointer.x, width: Math.abs(width) });
        }

        if (height > 0) {
          newObject.set({ height });
        } else {
          newObject.set({ top: pointer.y, height: Math.abs(height) });
        }
      } else if (activeTool === "circle") {
        const radius =
          Math.sqrt(
            Math.pow(pointer.x - startPoint.x, 2) +
              Math.pow(pointer.y - startPoint.y, 2)
          ) / 2;
        const centerX = (pointer.x + startPoint.x) / 2;
        const centerY = (pointer.y + startPoint.y) / 2;

        newObject.set({
          left: centerX - radius,
          top: centerY - radius,
          radius,
        });
      }

      canvas.renderAll();

      // Send cursor position
      socketService.sendCursorPosition({
        roomId,
        x: pointer.x,
        y: pointer.y,
      });
    };

    // Mouse up handler
    const handleMouseUp = () => {
      if (!isDrawing || !newObject) return;

      isDrawing = false;

      // Send object data to other users
      socketService.sendDrawEvent({
        roomId,
        userId,
        userName,
        objectData: JSON.stringify(newObject.toObject(["data"])),
        action: "add",
      });

      // Save to history after adding a new object
      saveToHistory();

      newObject = null;
      startPoint = null;
    };

    // Object modified handler
    const handleObjectModified = (options: fabric.IEvent) => {
      if (!options.target) return;

      // Send modified object data to other users
      socketService.sendDrawEvent({
        roomId,
        userId,
        userName,
        objectData: JSON.stringify(options.target.toObject(["data"])),
        action: "modify",
      });

      // Save to history after modifying an object
      saveToHistory();
    };

    // Object removed handler
    const handleObjectRemoved = (options: fabric.IEvent) => {
      if (!options.target || options.target.data?.isTemporary) return;

      // Send remove event to other users
      socketService.sendDrawEvent({
        roomId,
        userId,
        userName,
        objectData: options.target.data?.id,
        action: "remove",
      });
    };

    // Mouse move handler for cursor position
    const handleCanvasMouseMove = (options: fabric.IEvent) => {
      const pointer = canvas.getPointer(options.e);

      // Send cursor position
      socketService.sendCursorPosition({
        roomId,
        x: pointer.x,
        y: pointer.y,
      });
    };

    // Add event listeners
    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);
    canvas.on("object:modified", handleObjectModified);
    canvas.on("object:removed", handleObjectRemoved);
    canvas.on("mouse:move", handleCanvasMouseMove);

    // Cleanup
    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
      canvas.off("object:modified", handleObjectModified);
      canvas.off("object:removed", handleObjectRemoved);
      canvas.off("mouse:move", handleCanvasMouseMove);
    };
  }, [
    isReady,
    activeTool,
    activeColor,
    brushSize,
    roomId,
    userId,
    userName,
    readOnly,
    saveToHistory,
  ]);

  // Clear canvas
  const clearCanvas = useCallback(() => {
    if (!canvasRef.current) return;

    // Save state before clearing
    saveToHistory();

    canvasRef.current.clear();
    canvasRef.current.setBackgroundColor("#ffffff", () => {
      canvasRef.current?.renderAll();

      // Save empty state to history
      saveToHistory();
    });
  }, [saveToHistory]);

  // Save canvas as JSON
  const saveCanvasAsJSON = useCallback(() => {
    if (!canvasRef.current) return "";

    return JSON.stringify(canvasRef.current.toJSON(["data"]));
  }, []);

  // Load canvas from JSON
  const loadCanvasFromJSON = useCallback((json: string) => {
    if (!canvasRef.current) return;

    try {
      canvasRef.current.loadFromJSON(json, () => {
        canvasRef.current?.renderAll();
      });
    } catch (error) {
      console.error("Error loading canvas from JSON:", error);
    }
  }, []);

  // Export canvas as image
  const exportCanvasAsImage = useCallback(
    (format: "png" | "jpeg" | "svg" = "png") => {
      if (!canvasRef.current) return "";

      if (format === "svg") {
        return canvasRef.current.toSVG();
      }

      return canvasRef.current.toDataURL({
        format,
        quality: 0.8,
      });
    },
    []
  );

  // Undo function
  const undo = useCallback(() => {
    if (!canvasRef.current || historyIndex <= 0) return;

    const canvas = canvasRef.current;
    const newIndex = historyIndex - 1;

    // Temporarily disable saving to history to prevent loops
    setCanSaveToHistory(false);

    try {
      canvas.loadFromJSON(history[newIndex].canvasState, () => {
        canvas.renderAll();
        setHistoryIndex(newIndex);

        // Re-enable saving to history after a short delay
        setTimeout(() => setCanSaveToHistory(true), 100);
      });
    } catch (error) {
      console.error("Error during undo:", error);
      setCanSaveToHistory(true);
    }
  }, [history, historyIndex]);

  // Redo function
  const redo = useCallback(() => {
    if (!canvasRef.current || historyIndex >= history.length - 1) return;

    const canvas = canvasRef.current;
    const newIndex = historyIndex + 1;

    // Temporarily disable saving to history to prevent loops
    setCanSaveToHistory(false);

    try {
      canvas.loadFromJSON(history[newIndex].canvasState, () => {
        canvas.renderAll();
        setHistoryIndex(newIndex);

        // Re-enable saving to history after a short delay
        setTimeout(() => setCanSaveToHistory(true), 100);
      });
    } catch (error) {
      console.error("Error during redo:", error);
      setCanSaveToHistory(true);
    }
  }, [history, historyIndex]);

  // Delete selected objects
  const deleteSelectedObjects = useCallback(() => {
    if (!canvasRef.current) return;

    // Save state before deletion
    saveToHistory();

    const activeObjects = canvasRef.current.getActiveObjects();
    if (activeObjects.length === 0) return;

    canvasRef.current.remove(...activeObjects);
    canvasRef.current.discardActiveObject();
    canvasRef.current.renderAll();
  }, [saveToHistory]);

  // Utility function to generate random ID
  const generateId = () => {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  };

  // Utility function to generate random color based on user ID
  const getRandomColor = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }

    const c = (hash & 0x00ffffff).toString(16).toUpperCase();
    return "#" + "00000".substring(0, 6 - c.length) + c;
  };

  // Initialize history with empty canvas
  useEffect(() => {
    if (isReady && canvasRef.current && history.length === 0) {
      const initialState = JSON.stringify(canvasRef.current.toJSON(["data"]));
      setHistory([{ canvasState: initialState, timestamp: Date.now() }]);
      setHistoryIndex(0);
    }
  }, [isReady, history.length]);

  // Add event listeners for keyboard shortcuts
  useEffect(() => {
    if (!isReady || readOnly) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Undo: Ctrl+Z
      if (e.ctrlKey && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      // Redo: Ctrl+Y or Ctrl+Shift+Z
      if (
        (e.ctrlKey && e.key === "y") ||
        (e.ctrlKey && e.shiftKey && e.key === "Z")
      ) {
        e.preventDefault();
        redo();
      }

      // Delete selected objects: Delete key
      if (e.key === "Delete") {
        e.preventDefault();
        deleteSelectedObjects();
      }

      // Deselect all: Escape key
      if (e.key === "Escape") {
        e.preventDefault();
        canvasRef.current?.discardActiveObject();
        canvasRef.current?.renderAll();
      }

      // Tool shortcuts (only if no modifier keys)
      if (!e.ctrlKey && !e.altKey && !e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "s":
            e.preventDefault();
            setActiveTool("select");
            break;
          case "p":
            e.preventDefault();
            setActiveTool("pen");
            break;
          case "r":
            e.preventDefault();
            setActiveTool("rect");
            break;
          case "c":
            e.preventDefault();
            setActiveTool("circle");
            break;
          case "t":
            e.preventDefault();
            setActiveTool("text");
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isReady, readOnly, undo, redo, deleteSelectedObjects, setActiveTool]);

  return {
    containerRef,
    canvasRef,
    isReady,
    activeTool,
    setActiveTool,
    activeColor,
    setActiveColor,
    brushSize,
    setBrushSize,
    clearCanvas,
    saveCanvasAsJSON,
    loadCanvasFromJSON,
    exportCanvasAsImage,
    deleteSelectedObjects,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    saveToHistory,
  };
};

export default useCanvas;

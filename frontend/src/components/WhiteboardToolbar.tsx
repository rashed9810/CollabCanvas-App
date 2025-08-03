import React from "react";

interface WhiteboardToolbarProps {
  activeTool: "select" | "pen" | "rect" | "circle" | "text";
  setActiveTool: (tool: "select" | "pen" | "rect" | "circle" | "text") => void;
  activeColor: string;
  setActiveColor: (color: string) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  clearCanvas: () => void;
  saveCanvas: () => void;
  exportCanvas: () => void;
  deleteSelectedObjects: () => void;
  undo?: () => void;
  redo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  readOnly?: boolean;
}

const WhiteboardToolbar: React.FC<WhiteboardToolbarProps> = ({
  activeTool,
  setActiveTool,
  activeColor,
  setActiveColor,
  brushSize,
  setBrushSize,
  clearCanvas,
  saveCanvas,
  exportCanvas,
  deleteSelectedObjects,
  undo,
  redo,
  canUndo = false,
  canRedo = false,
  readOnly = false,
}) => {
  const [colorPickerOpen, setColorPickerOpen] = React.useState(false);
  const [colorPickerPosition, setColorPickerPosition] = React.useState({ x: 0, y: 0 });

  const handleColorClick = (e: React.MouseEvent) => {
    setColorPickerPosition({ x: e.clientX, y: e.clientY });
    setColorPickerOpen(true);
  };

  const handleColorClose = () => {
    setColorPickerOpen(false);
  };

  const commonButtonClasses = "p-2 rounded-lg transition-colors";
  const activeButtonClasses = "bg-purple-100 text-purple-700";
  const inactiveButtonClasses = "text-gray-600 hover:bg-gray-100";
  const disabledButtonClasses = "text-gray-400 cursor-not-allowed";

  // SVG Icons
  const PanToolIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0 0v2.5M7 14h3m-3 0H4m7-2.5V14m0 0v2.5M7 14v2.5M14 7h3m0 0v2.5M14 7v2.5m0 0V12m0-2.5h3m-3 9H7m7-9h3m-3 9h3m-3-9v9" />
    </svg>
  );

  const CreateIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  );

  const RectangleIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
    </svg>
  );

  const CircleIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );

  const TextFieldsIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
    </svg>
  );

  const DeleteIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );

  const SaveIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  );

  const DownloadIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );

  const ClearIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );

  const UndoIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );

  const RedoIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );

  if (readOnly) {
    return (
      <div className="absolute top-4 left-4 z-1000 flex flex-row items-center gap-1 bg-white rounded-lg shadow-lg p-2">
        <span className="text-gray-600 text-sm">View Only Mode</span>
        <button 
          onClick={exportCanvas}
          className={`${commonButtonClasses} ${inactiveButtonClasses}`}
          title="Export Canvas"
        >
          <DownloadIcon />
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-4 left-4 z-1000 flex flex-row items-center gap-1 bg-white rounded-lg shadow-lg p-2">
      {/* Drawing Tools */}
      <button
        onClick={() => setActiveTool("select")}
        className={`${commonButtonClasses} ${activeTool === "select" ? activeButtonClasses : inactiveButtonClasses}`}
        title="Select"
      >
        <PanToolIcon />
      </button>
      <button
        onClick={() => setActiveTool("pen")}
        className={`${commonButtonClasses} ${activeTool === "pen" ? activeButtonClasses : inactiveButtonClasses}`}
        title="Pen"
      >
        <CreateIcon />
      </button>
      <button
        onClick={() => setActiveTool("rect")}
        className={`${commonButtonClasses} ${activeTool === "rect" ? activeButtonClasses : inactiveButtonClasses}`}
        title="Rectangle"
      >
        <RectangleIcon />
      </button>
      <button
        onClick={() => setActiveTool("circle")}
        className={`${commonButtonClasses} ${activeTool === "circle" ? activeButtonClasses : inactiveButtonClasses}`}
        title="Circle"
      >
        <CircleIcon />
      </button>
      <button
        onClick={() => setActiveTool("text")}
        className={`${commonButtonClasses} ${activeTool === "text" ? activeButtonClasses : inactiveButtonClasses}`}
        title="Text"
      >
        <TextFieldsIcon />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      {/* Color Picker */}
      <button
        onClick={handleColorClick}
        className={`${commonButtonClasses} ${inactiveButtonClasses}`}
        title="Color"
      >
        <div 
          className="w-6 h-6 rounded-full border border-gray-300"
          style={{ backgroundColor: activeColor }}
        />
      </button>

      {/* Brush Size */}
      <div className="flex items-center mx-2 w-32">
        <input
          type="range"
          min="1"
          max="20"
          value={brushSize}
          onChange={(e) => setBrushSize(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <span className="ml-2 text-sm text-gray-600 w-6">{brushSize}</span>
      </div>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      {/* History Actions */}
      <button
        onClick={undo}
        disabled={!canUndo}
        className={`${commonButtonClasses} ${canUndo ? inactiveButtonClasses : disabledButtonClasses}`}
        title="Undo (Ctrl+Z)"
      >
        <UndoIcon />
      </button>
      <button
        onClick={redo}
        disabled={!canRedo}
        className={`${commonButtonClasses} ${canRedo ? inactiveButtonClasses : disabledButtonClasses}`}
        title="Redo (Ctrl+Y)"
      >
        <RedoIcon />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      {/* Actions */}
      <button
        onClick={deleteSelectedObjects}
        className={`${commonButtonClasses} ${inactiveButtonClasses}`}
        title="Delete Selected"
      >
        <DeleteIcon />
      </button>
      <button
        onClick={clearCanvas}
        className={`${commonButtonClasses} ${inactiveButtonClasses}`}
        title="Clear Canvas"
      >
        <ClearIcon />
      </button>
      <button
        onClick={saveCanvas}
        className={`${commonButtonClasses} ${inactiveButtonClasses}`}
        title="Save"
      >
        <SaveIcon />
      </button>
      <button
        onClick={exportCanvas}
        className={`${commonButtonClasses} ${inactiveButtonClasses}`}
        title="Export"
      >
        <DownloadIcon />
      </button>
      </div>
  );

  // Color Picker Modal
  const colorPickerModal = colorPickerOpen ? (
    <>
      <div 
        className="fixed inset-0 z-1001"
        onClick={handleColorClose}
      ></div>
      <div 
        className="fixed z-1002 bg-white rounded-lg shadow-xl p-4"
        style={{ 
          top: colorPickerPosition.y + 10, 
          left: colorPickerPosition.x 
        }}
      >
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
          <input
            type="color"
            value={activeColor}
            onChange={(e) => setActiveColor(e.target.value)}
            className="w-full h-10 border border-gray-300 rounded cursor-pointer"
          />
        </div>
        <div className="flex flex-wrap gap-1 max-w-40">
          {[
            "#000000",
            "#FF0000",
            "#00FF00",
            "#0000FF",
            "#FFFF00",
            "#FF00FF",
            "#00FFFF",
            "#FFFFFF",
          ].map((color) => (
            <div
              key={color}
              className="w-8 h-8 rounded cursor-pointer border border-gray-300 hover:opacity-80"
              style={{ backgroundColor: color }}
              onClick={() => {
                setActiveColor(color);
                handleColorClose();
              }}
            />
          ))}
        </div>
      </div>
    </>
  ) : null;

  return (
    <>
      <div className="absolute top-4 left-4 z-1000 flex flex-row items-center gap-1 bg-white rounded-lg shadow-lg p-2">
        {/* Drawing Tools */}
        <button
          onClick={() => setActiveTool("select")}
          className={`${commonButtonClasses} ${activeTool === "select" ? activeButtonClasses : inactiveButtonClasses}`}
          title="Select"
        >
          <PanToolIcon />
        </button>
        <button
          onClick={() => setActiveTool("pen")}
          className={`${commonButtonClasses} ${activeTool === "pen" ? activeButtonClasses : inactiveButtonClasses}`}
          title="Pen"
        >
          <CreateIcon />
        </button>
        <button
          onClick={() => setActiveTool("rect")}
          className={`${commonButtonClasses} ${activeTool === "rect" ? activeButtonClasses : inactiveButtonClasses}`}
          title="Rectangle"
        >
          <RectangleIcon />
        </button>
        <button
          onClick={() => setActiveTool("circle")}
          className={`${commonButtonClasses} ${activeTool === "circle" ? activeButtonClasses : inactiveButtonClasses}`}
          title="Circle"
        >
          <CircleIcon />
        </button>
        <button
          onClick={() => setActiveTool("text")}
          className={`${commonButtonClasses} ${activeTool === "text" ? activeButtonClasses : inactiveButtonClasses}`}
          title="Text"
        >
          <TextFieldsIcon />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Color Picker */}
        <button
          onClick={handleColorClick}
          className={`${commonButtonClasses} ${inactiveButtonClasses}`}
          title="Color"
        >
          <div 
            className="w-6 h-6 rounded-full border border-gray-300"
            style={{ backgroundColor: activeColor }}
          />
        </button>

        {/* Brush Size */}
        <div className="flex items-center mx-2 w-32">
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="ml-2 text-sm text-gray-600 w-6">{brushSize}</span>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* History Actions */}
        <button
          onClick={undo}
          disabled={!canUndo}
          className={`${commonButtonClasses} ${canUndo ? inactiveButtonClasses : disabledButtonClasses}`}
          title="Undo (Ctrl+Z)"
        >
          <UndoIcon />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className={`${commonButtonClasses} ${canRedo ? inactiveButtonClasses : disabledButtonClasses}`}
          title="Redo (Ctrl+Y)"
        >
          <RedoIcon />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Actions */}
        <button
          onClick={deleteSelectedObjects}
          className={`${commonButtonClasses} ${inactiveButtonClasses}`}
          title="Delete Selected"
        >
          <DeleteIcon />
        </button>
        <button
          onClick={clearCanvas}
          className={`${commonButtonClasses} ${inactiveButtonClasses}`}
          title="Clear Canvas"
        >
          <ClearIcon />
        </button>
        <button
          onClick={saveCanvas}
          className={`${commonButtonClasses} ${inactiveButtonClasses}`}
          title="Save"
        >
          <SaveIcon />
        </button>
        <button
          onClick={exportCanvas}
          className={`${commonButtonClasses} ${inactiveButtonClasses}`}
          title="Export"
        >
          <DownloadIcon />
        </button>
      </div>
      {colorPickerModal}
    </>
  );
};
 

export default WhiteboardToolbar;

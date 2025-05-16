import React from "react";
import {
  Box,
  Paper,
  IconButton,
  Tooltip,
  Divider,
  Slider,
  Popover,
  Typography,
  TextField,
} from "@mui/material";
import {
  PanTool,
  Create,
  Rectangle,
  RadioButtonUnchecked,
  TextFields,
  Delete,
  Save,
  Download,
  Clear,
  Undo,
  Redo,
} from "@mui/icons-material";

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
  const [colorPickerAnchor, setColorPickerAnchor] =
    React.useState<HTMLElement | null>(null);

  const handleColorClick = (event: React.MouseEvent<HTMLElement>) => {
    setColorPickerAnchor(event.currentTarget);
  };

  const handleColorClose = () => {
    setColorPickerAnchor(null);
  };

  const colorPickerOpen = Boolean(colorPickerAnchor);

  if (readOnly) {
    return (
      <Paper
        elevation={3}
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          zIndex: 1000,
          padding: 1,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          View Only Mode
        </Typography>
        <Tooltip title="Export Canvas">
          <IconButton onClick={exportCanvas}>
            <Download />
          </IconButton>
        </Tooltip>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{
        position: "absolute",
        top: 16,
        left: 16,
        zIndex: 1000,
        padding: 1,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 1,
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Drawing Tools */}
      <Tooltip title="Select">
        <IconButton
          color={activeTool === "select" ? "primary" : "default"}
          onClick={() => setActiveTool("select")}
        >
          <PanTool />
        </IconButton>
      </Tooltip>
      <Tooltip title="Pen">
        <IconButton
          color={activeTool === "pen" ? "primary" : "default"}
          onClick={() => setActiveTool("pen")}
        >
          <Create />
        </IconButton>
      </Tooltip>
      <Tooltip title="Rectangle">
        <IconButton
          color={activeTool === "rect" ? "primary" : "default"}
          onClick={() => setActiveTool("rect")}
        >
          <Rectangle />
        </IconButton>
      </Tooltip>
      <Tooltip title="Circle">
        <IconButton
          color={activeTool === "circle" ? "primary" : "default"}
          onClick={() => setActiveTool("circle")}
        >
          <RadioButtonUnchecked />
        </IconButton>
      </Tooltip>
      <Tooltip title="Text">
        <IconButton
          color={activeTool === "text" ? "primary" : "default"}
          onClick={() => setActiveTool("text")}
        >
          <TextFields />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem />

      {/* Color Picker */}
      <Tooltip title="Color">
        <IconButton onClick={handleColorClick}>
          <Box
            sx={{
              width: 24,
              height: 24,
              backgroundColor: activeColor,
              border: "1px solid #ccc",
              borderRadius: "50%",
            }}
          />
        </IconButton>
      </Tooltip>
      <Popover
        open={colorPickerOpen}
        anchorEl={colorPickerAnchor}
        onClose={handleColorClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Color"
            type="color"
            value={activeColor}
            onChange={(e) => setActiveColor(e.target.value)}
            fullWidth
            size="small"
          />
          <Box
            sx={{ display: "flex", flexWrap: "wrap", gap: 1, maxWidth: 220 }}
          >
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
              <Box
                key={color}
                sx={{
                  width: 30,
                  height: 30,
                  backgroundColor: color,
                  border: "1px solid #ccc",
                  cursor: "pointer",
                  "&:hover": {
                    opacity: 0.8,
                  },
                }}
                onClick={() => {
                  setActiveColor(color);
                  handleColorClose();
                }}
              />
            ))}
          </Box>
        </Box>
      </Popover>

      {/* Brush Size */}
      <Box sx={{ width: 100, mx: 1 }}>
        <Slider
          value={brushSize}
          onChange={(_, value) => setBrushSize(value as number)}
          min={1}
          max={20}
          step={1}
          aria-label="Brush Size"
          valueLabelDisplay="auto"
        />
      </Box>

      <Divider orientation="vertical" flexItem />

      {/* History Actions */}
      <Tooltip title="Undo (Ctrl+Z)">
        <span>
          <IconButton onClick={undo} disabled={!canUndo}>
            <Undo color={canUndo ? "action" : "disabled"} />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Redo (Ctrl+Y)">
        <span>
          <IconButton onClick={redo} disabled={!canRedo}>
            <Redo color={canRedo ? "action" : "disabled"} />
          </IconButton>
        </span>
      </Tooltip>

      <Divider orientation="vertical" flexItem />

      {/* Actions */}
      <Tooltip title="Delete Selected">
        <IconButton onClick={deleteSelectedObjects}>
          <Delete />
        </IconButton>
      </Tooltip>
      <Tooltip title="Clear Canvas">
        <IconButton onClick={clearCanvas}>
          <Clear />
        </IconButton>
      </Tooltip>
      <Tooltip title="Save">
        <IconButton onClick={saveCanvas}>
          <Save />
        </IconButton>
      </Tooltip>
      <Tooltip title="Export">
        <IconButton onClick={exportCanvas}>
          <Download />
        </IconButton>
      </Tooltip>
    </Paper>
  );
};

export default WhiteboardToolbar;

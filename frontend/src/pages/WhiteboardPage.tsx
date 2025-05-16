import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Snackbar,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Share as ShareIcon,
  People as PeopleIcon,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useWhiteboard } from "../context/WhiteboardContext";
import useCanvas from "../hooks/useCanvas";
import WhiteboardToolbar from "../components/WhiteboardToolbar";
import ChatSidebar from "../components/ChatSidebar";

const WhiteboardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentWhiteboard, getWhiteboard, updateWhiteboard, loading, error } =
    useWhiteboard();

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [whiteboardName, setWhiteboardName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [chatOpen, setChatOpen] = useState(false);

  // Initialize canvas hook
  const {
    containerRef,
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
    canUndo,
    canRedo,
  } = useCanvas({
    roomId: id || "",
    userId: user?._id || "",
    userName: user?.name || "",
    readOnly: false,
  });

  // Load whiteboard data
  useEffect(() => {
    if (id) {
      getWhiteboard(id);
    }
  }, [id, getWhiteboard]);

  // Update local state when whiteboard data is loaded
  useEffect(() => {
    if (currentWhiteboard) {
      setWhiteboardName(currentWhiteboard.name);
      setIsPublic(currentWhiteboard.isPublic);

      // Load canvas data if available
      if (currentWhiteboard.canvasData && isReady) {
        loadCanvasFromJSON(currentWhiteboard.canvasData);
      }
    }
  }, [currentWhiteboard, isReady, loadCanvasFromJSON]);

  // Handle save canvas
  const handleSaveCanvas = async () => {
    if (!currentWhiteboard || !id) return;

    try {
      const canvasData = saveCanvasAsJSON();
      await updateWhiteboard(id, { canvasData });

      setSnackbarMessage("Whiteboard saved successfully");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Failed to save whiteboard:", error);
      setSnackbarMessage("Failed to save whiteboard");
      setSnackbarOpen(true);
    }
  };

  // Handle export canvas
  const handleExportCanvas = () => {
    const dataUrl = exportCanvasAsImage();
    const link = document.createElement("a");
    link.download = `${whiteboardName || "whiteboard"}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle open save dialog
  const handleOpenSaveDialog = () => {
    setSaveDialogOpen(true);
  };

  // Handle close save dialog
  const handleCloseSaveDialog = () => {
    setSaveDialogOpen(false);
  };

  // Handle save whiteboard settings
  const handleSaveSettings = async () => {
    if (!id) return;

    try {
      await updateWhiteboard(id, {
        name: whiteboardName,
        isPublic,
      });

      setSaveDialogOpen(false);
      setSnackbarMessage("Whiteboard settings updated");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Failed to update whiteboard settings:", error);
    }
  };

  // Handle copy share link
  const handleCopyShareLink = () => {
    const shareUrl = `${window.location.origin}/whiteboard/${id}`;
    navigator.clipboard.writeText(shareUrl);

    setSnackbarMessage("Share link copied to clipboard");
    setSnackbarOpen(true);
  };

  // Handle back to dashboard
  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  // Handle chat toggle
  const handleChatToggle = () => {
    setChatOpen((prev) => !prev);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToDashboard}
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  if (!currentWhiteboard) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Whiteboard not found</Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToDashboard}
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 1,
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Tooltip title="Back to Dashboard">
            <IconButton onClick={handleBackToDashboard}>
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h6" sx={{ ml: 1 }}>
            {whiteboardName}
          </Typography>
        </Box>
        <Box>
          <Tooltip title="Save Whiteboard">
            <IconButton onClick={handleSaveCanvas}>
              <SaveIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Share">
            <IconButton onClick={handleCopyShareLink}>
              <ShareIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Whiteboard Settings">
            <IconButton onClick={handleOpenSaveDialog}>
              <PeopleIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Canvas Container */}
      <Box
        ref={containerRef}
        sx={{
          flexGrow: 1,
          position: "relative",
          overflow: "hidden",
          bgcolor: "#f5f5f5",
        }}
      >
        <canvas id="canvas" />

        {/* Toolbar */}
        <WhiteboardToolbar
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          activeColor={activeColor}
          setActiveColor={setActiveColor}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          clearCanvas={clearCanvas}
          saveCanvas={handleSaveCanvas}
          exportCanvas={handleExportCanvas}
          deleteSelectedObjects={deleteSelectedObjects}
          undo={undo}
          redo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
        />
      </Box>

      {/* Settings Dialog */}
      <Dialog
        open={saveDialogOpen}
        onClose={handleCloseSaveDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Whiteboard Settings</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Whiteboard Name"
            type="text"
            fullWidth
            value={whiteboardName}
            onChange={(e) => setWhiteboardName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="body1">Public Whiteboard:</Typography>
            <Button
              variant={isPublic ? "contained" : "outlined"}
              color={isPublic ? "primary" : "inherit"}
              onClick={() => setIsPublic(true)}
              sx={{ ml: 2, mr: 1 }}
            >
              Yes
            </Button>
            <Button
              variant={!isPublic ? "contained" : "outlined"}
              color={!isPublic ? "primary" : "inherit"}
              onClick={() => setIsPublic(false)}
            >
              No
            </Button>
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 1 }}
          >
            Public whiteboards can be accessed by anyone with the link.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSaveDialog}>Cancel</Button>
          <Button onClick={handleSaveSettings} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />

      {/* Chat Sidebar */}
      {id && user && (
        <ChatSidebar
          roomId={id}
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          onToggle={handleChatToggle}
        />
      )}
    </Box>
  );
};

export default WhiteboardPage;

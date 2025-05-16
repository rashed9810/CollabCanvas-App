import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useWhiteboard } from "../context/WhiteboardContext";
import WhiteboardList from "../components/WhiteboardList";
import NewWhiteboardForm from "../components/NewWhiteboardForm";

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const {
    whiteboards,
    loading,
    error,
    getWhiteboards,
    createWhiteboard,
    deleteWhiteboard,
    clearError,
  } = useWhiteboard();
  const navigate = useNavigate();

  useEffect(() => {
    getWhiteboards();

    return () => {
      clearError();
    };
  }, [getWhiteboards, clearError]);

  const handleCreateWhiteboard = async (name: string, isPublic: boolean) => {
    try {
      const newWhiteboard = await createWhiteboard(name, isPublic);
      navigate(`/whiteboard/${newWhiteboard._id}`);
    } catch (error) {
      console.error("Failed to create whiteboard:", error);
    }
  };

  const handleDeleteWhiteboard = async (id: string) => {
    try {
      await deleteWhiteboard(id);
    } catch (error) {
      console.error("Failed to delete whiteboard:", error);
    }
  };

  return (
    <Container maxWidth="lg" className="px-4 sm:px-6 lg:px-8">
      <Box className="mt-4 mb-6">
        <Typography variant="h4" className="text-center font-bold">
          Dashboard
        </Typography>
        <Typography variant="subtitle1" className="text-center text-gray-600">
          Welcome back, {user?.name}! Manage your whiteboards here.
        </Typography>

        <Box className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <NewWhiteboardForm onCreate={handleCreateWhiteboard} />

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Your Whiteboards
            </Typography>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <WhiteboardList
                whiteboards={whiteboards}
                currentUser={user!}
                onDelete={handleDeleteWhiteboard}
              />
            )}
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default DashboardPage;

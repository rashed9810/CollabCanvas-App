import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Public as PublicIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { Whiteboard, User } from "../types";

interface WhiteboardListProps {
  whiteboards: Whiteboard[];
  currentUser: User;
  onDelete: (id: string) => void;
}

const WhiteboardList: React.FC<WhiteboardListProps> = ({
  whiteboards,
  currentUser,
  onDelete,
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [whiteboardToDelete, setWhiteboardToDelete] = useState<string | null>(
    null
  );

  const handleDeleteClick = (id: string) => {
    setWhiteboardToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (whiteboardToDelete) {
      onDelete(whiteboardToDelete);
      setDeleteDialogOpen(false);
      setWhiteboardToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setWhiteboardToDelete(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  if (whiteboards.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No whiteboards found. Create a new one to get started.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <List>
        {whiteboards.map((whiteboard) => {
          const isOwner =
            typeof whiteboard.owner === "object"
              ? whiteboard.owner._id === currentUser._id
              : whiteboard.owner === currentUser._id;

          return (
            <ListItem
              key={whiteboard._id}
              component={Link}
              to={`/whiteboard/${whiteboard._id}`}
              sx={{
                mb: 1,
                borderRadius: 1,
                border: "1px solid #e0e0e0",
                textDecoration: "none",
                color: "inherit",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              <ListItemAvatar>
                <Avatar>
                  <DashboardIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {whiteboard.name}
                    {whiteboard.isPublic ? (
                      <Tooltip title="Public">
                        <PublicIcon fontSize="small" color="action" />
                      </Tooltip>
                    ) : (
                      <Tooltip title="Private">
                        <LockIcon fontSize="small" color="action" />
                      </Tooltip>
                    )}
                  </Box>
                }
                secondary={
                  <>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      {isOwner ? "Owner" : "Collaborator"}
                    </Typography>
                    {" — "}
                    Last updated: {formatDate(whiteboard.updatedAt)}
                  </>
                }
              />
              {isOwner && (
                <ListItemSecondaryAction>
                  <Tooltip title="Edit">
                    <IconButton
                      edge="end"
                      component={Link}
                      to={`/whiteboard/${whiteboard._id}`}
                      aria-label="edit"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteClick(whiteboard._id);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              )}
            </ListItem>
          );
        })}
      </List>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Delete Whiteboard</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this whiteboard? This action cannot
            be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default WhiteboardList;

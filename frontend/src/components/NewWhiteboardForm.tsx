import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Typography,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";

interface NewWhiteboardFormProps {
  onCreate: (name: string, isPublic: boolean) => Promise<void>;
}

const NewWhiteboardForm: React.FC<NewWhiteboardFormProps> = ({ onCreate }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setName("");
    setIsPublic(false);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Please enter a name for your whiteboard");
      return;
    }

    try {
      setLoading(true);
      await onCreate(name, isPublic);
      handleClose();
    } catch (error: any) {
      setError(error.message || "Failed to create whiteboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleOpen}
        sx={{ mb: 3 }}
      >
        New Whiteboard
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Whiteboard</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Whiteboard Name"
              type="text"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={!!error}
              helperText={error}
              required
            />
            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    color="primary"
                  />
                }
                label="Make this whiteboard public"
              />
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                Public whiteboards can be accessed by anyone with the link.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" color="primary" disabled={loading}>
              Create
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default NewWhiteboardForm;

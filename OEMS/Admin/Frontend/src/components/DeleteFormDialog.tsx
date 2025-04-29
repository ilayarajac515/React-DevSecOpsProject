import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

interface DeleteFormDialogProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  selectedForm: any;
}

const DeleteFormDialog: React.FC<DeleteFormDialogProps> = ({
  open,
  onClose,
  onDelete,
  selectedForm,
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: "bold" }}>Confirm Deletion</DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          Are you sure you want to delete the{" "}
          <strong>{selectedForm?.label}</strong> form? This action cannot be
          undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onDelete}
          variant="contained"
          color="error"
          disableElevation
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteFormDialog;

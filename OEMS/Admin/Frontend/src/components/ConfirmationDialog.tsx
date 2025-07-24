import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  itemLabel?: string;
  confirmLabel?: string;
  title?: string;
  description?: React.ReactNode;
}

const ConfirmationDialog = ({
  open,
  onClose,
  onDelete,
  itemLabel,
  confirmLabel = "Delete",
  title = "Confirm",
  description,
}: ConfirmationDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{fontWeight:"bold"}}>{title}</DialogTitle>
      <DialogContent>
        <Typography>
          {description ||
            `Are you sure you want to ${confirmLabel?.toLowerCase()} ${
              itemLabel || "this"
            }?`}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onDelete} variant="contained" color= {confirmLabel ===  "Submit" ? "success" : "error"}> 
          {confirmLabel === "Submit" ? "ok" : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;

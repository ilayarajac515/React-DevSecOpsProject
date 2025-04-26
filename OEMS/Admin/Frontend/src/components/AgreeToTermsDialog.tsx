import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

interface AgreeToTermsDialogProps {
  open: boolean;
  onClose: () => void;
  onAgree: () => void;
  termsAccepted: boolean;
  handleTermsChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const AgreeToTermsDialog: React.FC<AgreeToTermsDialogProps> = ({
  open,
  onClose,
  onAgree,
  termsAccepted,
  handleTermsChange,
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: "bold" }}>Agree to Terms and Conditions</DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          Please read the following instructions and warnings before proceeding:
        </Typography>
        <Typography variant="body2" sx={{ color: "red", mt: 2 }}>
          Warning: This form contains sensitive information. Ensure you understand the privacy policies before submitting.
        </Typography>
        <FormControlLabel
          control={
            <Checkbox checked={termsAccepted} onChange={handleTermsChange} name="terms" />
          }
          label="I agree to the terms and conditions"
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onAgree} variant="contained" disableElevation>
          Agree
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AgreeToTermsDialog;

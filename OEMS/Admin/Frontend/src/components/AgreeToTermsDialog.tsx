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
  Box,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

interface AgreeToTermsDialogProps {
  open: boolean;
  onClose: () => void;
  onAgree: () => void;
  termsAccepted: boolean;
  handleTermsChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  instructions: string;
}

const AgreeToTermsDialog: React.FC<AgreeToTermsDialogProps> = ({
  open,
  onClose,
  onAgree,
  termsAccepted,
  handleTermsChange,
  instructions,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="terms-dialog-title"
      aria-describedby="terms-dialog-description"
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
          maxWidth: "600px",
          width: "90%",
        },
      }}
    >
      <DialogTitle
        id="terms-dialog-title"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          backgroundColor: "#e3f2fd",
          color: "#1976d2",
          fontWeight: "bold",
          padding: "16px 24px",
          borderBottom: "1px solid #bbdefb",
        }}
      >
        <InfoOutlinedIcon sx={{ fontSize: 28 }} />
        Terms and Conditions
      </DialogTitle>
      <DialogContent sx={{ padding: "24px" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            marginTop: "10px",
          }}
        >
          <Typography
            id="terms-dialog-description"
            variant="body1"
            color="text.primary"
            sx={{ lineHeight: 1.6 }}
          >
            Before proceeding with the assessment, please review and acknowledge
            the terms and conditions outlined below.
          </Typography>
          <Typography
            variant="body2"
            color="error.main"
            sx={{ fontWeight: "medium", lineHeight: 1.5 }}
          >
            <strong>Important:</strong> This assessment contains sensitive
            information. Ensure you understand our privacy policies, as your
            submission is subject to these terms.
          </Typography>
          <Box component="ul" sx={{ pl: 3, m: 0 }}>
            {instructions
              .split("\n")
              .filter((line) => line.trim() !== "")
              .map((line, index) => (
                <li key={index}>
                  <Typography variant="body2">
                    {line.replace(/^[-–•]\s*/, "")}
                  </Typography>
                </li>
              ))}
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                checked={termsAccepted}
                onChange={handleTermsChange}
                name="terms"
                color="primary"
                sx={{ "& .MuiSvgIcon-root": { fontSize: 24 } }}
              />
            }
            label={
              <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                I agree to the Terms and Conditions and Proceed to Start Test
              </Typography>
            }
            sx={{ mt: 1 }}
          />
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          padding: "16px 24px",
          borderTop: "1px solid #e0e0e0",
          justifyContent: "flex-end",
          gap: 1,
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          color="primary"
          sx={{
            textTransform: "none",
            fontWeight: "medium",
            padding: "8px 16px",
            borderRadius: "8px",
            "&:hover": {
              backgroundColor: "#f5f5f5",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onAgree}
          variant="contained"
          color="success"
          disabled={!termsAccepted}
          sx={{
            textTransform: "none",
            fontWeight: "medium",
            padding: "8px 16px",
            borderRadius: "8px",
          }}
        >
          Start Test
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AgreeToTermsDialog;

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

interface WarningDialogProps {
  open: boolean;
  onClose: () => void;
  tabSwitchCount: number;
  maxTabSwitches: number;
}

const WarningDialog = ({
  open,
  onClose,
  tabSwitchCount,
  maxTabSwitches,
}: WarningDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="warning-dialog-title"
      aria-describedby="warning-dialog-description"
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
          maxWidth: "500px",
          width: "90%",
        },
      }}
    >
      <DialogTitle
        id="warning-dialog-title"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          backgroundColor: "#fff3e0",
          color: "#d84315",
          fontWeight: "bold",
          padding: "16px 24px",
          borderBottom: "1px solid #ffccbc",
        }}
      >
        <WarningAmberIcon sx={{ fontSize: 28 }} />
        Tab Switch Warning
      </DialogTitle>
      <DialogContent sx={{ padding: "24px" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 , marginTop:"10px"}}>
          <Typography
            id="warning-dialog-description"
            variant="body1"
            color="text.primary"
            sx={{ lineHeight: 1.6 }}
          >
            Switching tabs or minimizing the browser is prohibited during the
            assessment. You have received{" "}
            <strong>
              warning {tabSwitchCount || 0} of {maxTabSwitches}
            </strong>
            .
          </Typography>
          <Typography
            variant="body2"
            color="error.main"
            sx={{ fontWeight: "medium" }}
          >
            Exceeding the maximum allowed warnings will result in automatic
            submission of your assessment.
          </Typography>
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
          variant="contained"
          color="primary"
          sx={{
            textTransform: "none",
            fontWeight: "medium",
            padding: "8px 16px",
            borderRadius: "8px",
            "&:hover": {
              backgroundColor: "#1565c0",
            },
          }}
        >
          Continue Assessment
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WarningDialog;

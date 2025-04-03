import { Box, Button, TextField, Typography, Alert, Paper } from "@mui/material";
import { useState, useEffect, ChangeEvent } from "react";
import { resetPass, verifyToken } from "../Services/UserService";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isTokenValid, setIsTokenValid] = useState<boolean>(false);
  const [hasReset, setHasReset] = useState<boolean>(false);
  const { userId, token, expiry } = useParams<Record<string, string | undefined>>();
  const navigate = useNavigate();

  useEffect(() => {
    const checkTokenValidity = async () => {
      try {
        const response = await verifyToken(userId, token, expiry);
        if (response.status) {
          setIsTokenValid(true);
        } else {
          setIsTokenValid(false);
        }
      } catch (error) {
        console.error("Error verifying token:", error);
        setIsTokenValid(false);
      }
    };

    if (userId && token && expiry) {
      checkTokenValidity();
    }
  }, [userId, token, expiry]);

  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      if (userId && token && isTokenValid) {
        const response = await resetPass(userId, token, password, expiry || "");
        if (response.message) {
          toast.success("Password reset successful!");
          setHasReset(true);
          navigate("/Sign-in");
        }
      } else {
        toast.error("Invalid or expired token.");
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5" px={2}>
      <Paper elevation={3} sx={{ padding: 4, maxWidth: 400, width: "100%", borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom align="center">
          Reset Password
        </Typography>

        {isTokenValid && !hasReset ? (
          <>
            <TextField
              type="password"
              label="New Password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              type="password"
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <Button onClick={handleResetPassword} variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
              Submit
            </Button>
          </>
        ) : (
          <Alert severity="error">
            {hasReset ? "Your password has already been reset." : "Invalid or expired reset token. Please request a new link."}
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default ResetPassword;

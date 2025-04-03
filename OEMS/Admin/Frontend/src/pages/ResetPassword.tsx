import { Box, Button, TextField, Typography, Alert, AlertTitle } from "@mui/material";
import { useEffect, useState } from "react";
import { resetLink, resetPass } from "../Services/UserService";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const { userId, token } = useParams<{ userId?: string; token?: string }>();
  const [reset, setReset] = useState<{ passwordResetToken?: string; passwordResetTokenExpires?: string }>({});
  const navigate = useNavigate();

  useEffect(() => {
    const verifyLink = async () => {
      if (userId && token) {
        try {
          const data = await resetLink(userId);
          const { passwordResetToken, passwordResetTokenExpires } = data;
          setReset({ passwordResetToken, passwordResetTokenExpires });
        } catch (err: any) {
          console.error("Invalid or expired reset link.");
          setReset({});
        }
      }
    };
    verifyLink();
  }, [userId, token, resetPass]);

  const handleResetPassword = async () => {
    if (!userId || !token) {
      console.error("Invalid request: Missing user ID or token");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      await resetPass(userId, token, password);
      console.log("Password reset successful");
      toast.success("Password reset successfully!");
      navigate('/Sign-in');
    } catch (err: any) {
      console.log(err.response.data.error);
    }
  };

  return (
    <Box
      sx={{
        width: { xs: "90%", sm: "400px", md: "450px" },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "20px",
        padding: "40px",
        marginTop: "50px",
        border: "1px solid #ddd",
        borderRadius: "12px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        backgroundColor: "white",
        mx: "auto",
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: "bold", color: "#333" }}>
        Reset Password
      </Typography>

      {reset.passwordResetToken === token ? (
        <>
          <TextField
            sx={{ width: "100%" }}
            id="new-password"
            type="password"
            label="New Password"
            variant="outlined"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <TextField
            sx={{ width: "100%" }}
            id="confirm-password"
            type="password"
            label="Confirm Password"
            variant="outlined"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button
            sx={{ width: "100%", padding: "12px", fontSize: "16px" }}
            variant="contained"
            color="primary"
            onClick={handleResetPassword}
          >
            Submit
          </Button>
        </>
      ) : (
        <Alert
          severity="error"
          sx={{
            width: "100%",
            backgroundColor: "#f8d7da",
            color: "#721c24",
            border: "1px solid #f5c6cb",
            padding: "16px",
            borderRadius: "8px",
          }}
        >
          <AlertTitle>Error</AlertTitle>
          Your password reset token is either invalid or has expired. Please request a new password reset link.
        </Alert>
      )}
    </Box>
  );
};

export default ResetPassword;

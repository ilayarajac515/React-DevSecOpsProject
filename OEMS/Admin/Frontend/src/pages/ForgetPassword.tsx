import { Box, Button, TextField, Typography, CircularProgress, Paper } from "@mui/material";
import { useState, ChangeEvent } from "react";
import { forgotPass } from "../Services/UserService";

const ForgetPassword: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [status, setStatus] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await forgotPass(email);
      setStatus(response.status);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f5f5f5"
      px={2}
    >
      <Paper elevation={3} sx={{ padding: 4, maxWidth: 400, width: "100%", borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom align="center">
          Forgot Password
        </Typography>
        <Typography variant="body2" color="textSecondary" align="center" paragraph>
          Enter your email to receive a password reset link.
        </Typography>

        <TextField
          type="email"
          label="Email"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          fullWidth
          margin="normal"
          required
        />

        {status && !loading && (
          <Typography color="success.main" align="center" sx={{ mt: 1 }}>
            Password reset link sent!
          </Typography>
        )}

        <Button
          onClick={handleSubmit}
          disabled={loading}
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Send Reset Link"}
        </Button>
      </Paper>
    </Box>
  );
};

export default ForgetPassword;

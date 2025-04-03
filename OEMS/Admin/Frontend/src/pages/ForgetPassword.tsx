import { Box, Button, CircularProgress, TextField, Typography } from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPass } from "../Services/UserService";

const ForgetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [status, setStatus] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const response = await forgotPass(email);
    //   if(status){
    //     setStatus(false)
    //   }
        setStatus(response.status);
        setLoading(false);
    } catch (error) {
      console.error("Error sending email:", error);
      setLoading(false);
    }
  };

  const handleLogin = () => {
    navigate("/sign-in");
  };

  return (
    <Box
      sx={{
        width: { xs: "90%", sm: "400px", md: "450px" },
        height: "auto",
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
        Forgot Password
      </Typography>
      <TextField
        sx={{ width: "100%" }}
        id="email"
        type="email"
        label="Email"
        variant="outlined"
        placeholder="Your email"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
      />
      {
      status && !loading && (
            <Typography variant="body1" sx={{ fontWeight: "400", color: "#4CAF50" }}>
              ✅ Reset link has been sent to your email.
            </Typography>
          )
        }

      <Button
        sx={{ width: "100%", padding: "12px", fontSize: "16px" }}
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={loading} // Disable button when loading
      >
        {loading ? <CircularProgress color="primary" size={24}  /> : "Submit"}
      </Button>

      <Button
        sx={{ width: "100%", padding: "12px", fontSize: "16px" }}
        variant="text"
        color="inherit"
        onClick={handleLogin}
      >
        Back to Login
      </Button>
    </Box>
  );
};

export default ForgetPassword;

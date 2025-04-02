import { Box, Button, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { resetPass } from "../Services/UserService";
import { useParams } from "react-router-dom";

const ResetPassword = () => {
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const { userId, token } = useParams<{ userId?: string; token?: string }>();
  
  const handleResetPassword = async () => {
    if (!userId || !token) {
      console.error("Invalid request: Missing user ID or token");
      return;
    }

    if (password !== confirmPassword) {
      console.error("Passwords do not match");
      return;
    }
    try{
       await resetPass(userId, token, password);
    }
    catch(err:any){
        console.log(err.response.data.error);
        
    }
    
};
console.log(userId,token,password);

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
        Reset Password
      </Typography>

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
        type="submit"
        onClick={handleResetPassword}
      >
        Submit
      </Button>
    </Box>
  );
};

export default ResetPassword;

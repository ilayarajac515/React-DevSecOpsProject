import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { resetPass, verifyToken } from "../Services/adminService";
import { toast } from "react-toastify";
import { Visibility, VisibilityOff } from "@mui/icons-material";

type FormValues = {
  password: string;
  confirmPassword: string;
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const { userId, token, expiry } =
    useParams<Record<string, string | undefined>>();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>();

  const [existError, setExistError] = useState("");
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confrmPassword, setConfirmPassword] = useState(false);

  const passwordValue = watch("password");
  const confirmPasswordValue = watch("confirmPassword");

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

  useEffect(() => {
    if (existError) {
      setExistError("");
    }
  }, [passwordValue, confirmPasswordValue]);

  const onSubmit: SubmitHandler<FormValues> = async ({
    password,
    confirmPassword,
  }) => {
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      if (userId && token && isTokenValid) {
        const response = await resetPass(userId, token, password, expiry || "");
        if (response.message) {
          toast.success("Password reset successful!");
          navigate("/");
        }
      } else {
        toast.error("Invalid or expired token.");
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
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

      {isTokenValid ? (
        <>
          <TextField
            sx={{ width: "100%" }}
            id="new-password"
            type={showPassword ? "text" : "password"}
            label="New Password"
            variant="outlined"
            placeholder="Your password"
            {...register("password", { required: "Password is required" })}
            error={!!errors.password}
            helperText={errors.password?.message}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            sx={{ width: "100%" }}
            id="confirm-password"
            type={confrmPassword ? "text" : "password"}
            label="Confirm New Password"
            variant="outlined"
            placeholder="Confirm New password"
            {...register("confirmPassword", {
              required: "Password is required",
            })}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setConfirmPassword((prev) => !prev)}
                    >
                      {confrmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button
            sx={{ width: "100%", padding: "12px", fontSize: "16px" }}
            variant="contained"
            color="primary"
            type="submit"
          >
            Submit
          </Button>
        </>
      ) : (
        <Alert severity="error" sx={{ width: "100%" }}>
          {"Invalid or expired reset token. Please request a new link."}
        </Alert>
      )}
    </Box>
  );
};

export default ResetPassword;

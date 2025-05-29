import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { signUp, sendOtp, verifyOtp } from "../Services/adminService";
import { toast } from "react-toastify";

type FormValues = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  otpCode: string;
};

const SignUpPage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormValues>();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [existError, setExistError] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [otpId, setOtpId] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const emailValue = watch("email");

  useEffect(() => {
    if (existError) {
      setExistError("");
    }
  }, [emailValue]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const { fullName, email, password, otpCode } = data;
    setIsLoading(true);

    if (!otpStep) {
      try {
        const response = await sendOtp(fullName, email, password);
        setOtpId(response.otpId);
        setOtpStep(true);
        toast.info("OTP sent to admin for verification");
      } catch (err: any) {
        console.error("Send OTP error:", err);
        setExistError(err?.error);
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        await verifyOtp(otpId, otpCode);
        await signUp(fullName, email, password, otpCode, otpId);
        setExistError("");
        setOtpError("");
        navigate("/");
        toast.success("Sign Up successful!");
      } catch (err: any) {
        console.error("Verify OTP error:", err.response?.data?.error);
        setOtpError(err.response?.data?.error || "Invalid OTP");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      autoComplete="off"
      sx={{
        width: { xs: "90%", sm: "400px", md: "450px" },
        padding: "40px",
        mt: "50px",
        border: "1px solid #ddd",
        borderRadius: "12px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        backgroundColor: "white",
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "30px",
        alignItems: "center",
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: "bold", color: "#333" }}>
        Admin Sign Up
      </Typography>

      <TextField
        sx={{ width: "100%" }}
        id="fullName"
        label="Full Name"
        variant="outlined"
        placeholder="Your full name"
        disabled={otpStep}
        {...register("fullName", { required: "Full name is required" })}
        error={!!errors.fullName}
        helperText={errors.fullName?.message}
      />

      <TextField
        sx={{ width: "100%" }}
        id="email"
        label="Email"
        variant="outlined"
        placeholder="Your email"
        autoComplete="new-email"
        disabled={otpStep}
        {...register("email", {
          required: "Email is required",
          pattern: {
          value: /^[a-zA-Z0-9._%+-]+@infoane\.com$/,
          message: "Email must be a valid",
        },
        })}
        error={!!errors.email || !!existError}
        helperText={errors.email?.message || existError}
      />

      <TextField
        sx={{ width: "100%" }}
        id="password"
        type={showPassword ? "text" : "password"}
        label="Password"
        variant="outlined"
        placeholder="Your password"
        autoComplete="new-password"
        disabled={otpStep}
        {...register("password", { required: "Password is required" })}
        error={!!errors.password}
        helperText={errors.password?.message}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={otpStep}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Box sx={{ width: "100%", display: "flex", gap: 2, flexWrap: "wrap" }}>
        <TextField
          fullWidth
          id="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          label="Confirm Password"
          variant="outlined"
          placeholder="Confirm your password"
          autoComplete="new-password"
          disabled={otpStep}
          {...register("confirmPassword", {
            required: "Confirm password is required",
            validate: (value) =>
              value === watch("password") || "Passwords do not match",
          })}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  disabled={otpStep}
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {otpStep && (
          <TextField
            sx={{ minWidth: "160px" }}
            id="otp"
            label="OTP"
            fullWidth
            variant="outlined"
            placeholder="Enter OTP"
            autoComplete="one-time-code"
            {...register("otpCode", {
              required: "OTP is required",
              pattern: {
                value: /^\d{6}$/,
                message: "OTP must be 6 digits",
              },
            })}
            error={!!errors.otpCode || !!otpError}
            helperText={errors.otpCode?.message || otpError}
          />
        )}
      </Box>

      <Button
        sx={{ width: "100%", padding: "12px", fontSize: "16px" }}
        variant="contained"
        color="primary"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? (
          <CircularProgress size={24} />
        ) : otpStep ? (
          "Verify OTP"
        ) : (
          "Sign Up"
        )}
      </Button>

      <Typography>
        Already have an account?{" "}
        <span
          onClick={() => navigate("/")}
          style={{ fontSize: "14px", color: "#007bff", cursor: "pointer" }}
        >
          Sign In
        </span>
      </Typography>
    </Box>
  );
};

export default SignUpPage;

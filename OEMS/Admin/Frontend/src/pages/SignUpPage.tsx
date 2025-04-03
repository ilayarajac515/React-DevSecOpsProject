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
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { signUp } from "../Services/UserService";
import { toast } from "react-toastify";

type FormValues = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
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

  const emailValue = watch("email");

  useEffect(() => {
    if (existError) {
      setExistError("");
    }
  }, [emailValue]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const { fullName, email, password } = data;
    try {
      await signUp(fullName, email, password);
      setExistError("");
      navigate("/sign-in");
      toast.success("Sign Up successfull!");
    } catch (err: any) {
      console.log(err.response.data.error);
      setExistError(err.response.data.error);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
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
        {...register("email", {
          required: "Email is required",
          pattern: {
            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
            message: "Invalid email format",
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
        {...register("password", { required: "Password is required" })}
        error={!!errors.password}
        helperText={errors.password?.message}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword((prev) => !prev)}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <TextField
        sx={{ width: "100%" }}
        id="confirmPassword"
        type={showConfirmPassword ? "text" : "password"}
        label="Confirm Password"
        variant="outlined"
        placeholder="Confirm your password"
        {...register("confirmPassword", {
          required: "Confirm password is required",
          validate: (value) =>
            value === watch("password") || "Passwords do not match",
        })}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
        Sign Up
      </Button>
      <Typography>
        Already have an account?{" "}
        <span
          onClick={() => navigate("/sign-in")}
          style={{ fontSize: "14px", color: "#007bff", cursor: "pointer" }}
        >
          Sign In
        </span>
      </Typography>
    </Box>
  );
};

export default SignUpPage;

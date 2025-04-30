import {
  Box,
  Button,
  TextField,
  Typography,
} from "@mui/material";
import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { forgotPass } from "../Services/UserService";
import { toast } from "react-toastify";

type FormValues = {
  email: string;
};

const ForgetPassword = () => {
  const navigate = useNavigate();
  
  const [existError, setExistError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>();
  const emailValue = watch('email');

  useEffect(() => {
    if (existError) {
      setExistError("");
    }
  }, [emailValue]);

  const onSubmit: SubmitHandler<FormValues> = async ({ email }) => {
    setLoading(true);
    try {
      await forgotPass(email);
      setExistError("");
      toast.success("Password reset link sent!");
      reset();
    } catch (err: any) {
      setExistError(err.response?.data?.error || "Something went wrong!");
    } finally {
      setLoading(false);
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
        Forgot Password
      </Typography>
      <Typography
        variant="body2"
        color="textSecondary"
        align="center"
        sx={{ width: "100%" }}
      >
        Enter your email to receive a password reset link.
      </Typography>
      <TextField
        sx={{ width: "100%" }}
        id="email"
        type="email"
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
      <Button
        sx={{ width: "100%", padding: "12px", fontSize: "16px" }}
        variant="contained"
        color="primary"
        type="submit"
        disabled={loading}
      >
        {loading ? "Sending..." : "Send Reset Link"}
      </Button>
      <Typography>
        Back to{" "}
        <span
          onClick={() => navigate("/")}
          style={{
            fontSize: "14px",
            color: "#007bff",
            cursor: "pointer",
          }}
        >
          Sign In
        </span>
      </Typography>
    </Box>
  );
};

export default ForgetPassword;

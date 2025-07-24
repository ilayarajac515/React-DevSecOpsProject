import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useForm, SubmitHandler } from "react-hook-form";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetFormByIdQuery,
  useLoginCandidateMutation,
} from "../modules/candidate_slice";
import { useCandidate } from "../context/CandidateContext";

type FormValues = {
  email: string;
  password: string;
};

const CandidateLogin = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>();
  const [showPassword, setShowPassword] = useState(false);
  const [existError, setExistError] = useState("");
  const [loading, setLoading] = useState(false);
  const emailValue = watch("email");
  const passwordValue = watch("password");
  const [candidateLogin] = useLoginCandidateMutation();
  const { setAuth } = useCandidate();
  useEffect(() => {
    if (existError) {
      setExistError("");
    }
  }, [emailValue, passwordValue]);

  const { formId } = useParams();
  const { data: formData , isLoading} = useGetFormByIdQuery(formId ?? "");
  
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    try {
      await candidateLogin({
        email: data.email,
        password: data.password,
        formId: formId ?? "",
      }).unwrap();
      setAuth({ email: data.email, authorized: true });
      setExistError("");
      reset();
      navigate(`/assessment-page/${formId}`);
    } catch (err: any) {
      setExistError(err?.data?.message || "Login failed. Try again.");
    }
    finally {
    setLoading(false);
  }
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  if (isLoading) {
    return null;
  }

  if (formData?.status !== "active") {
    return (
      <Box
        sx={{
          width: { xs: "90%", sm: "400px", md: "450px" },
          padding: "40px",
          mt: "50px",
          border: "1px solid #ddd",
          borderRadius: "12px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          backgroundColor: "white",
          mx: "auto",
        }}
      >
        <Alert severity="error" sx={{ width: "100%" }}>
          Invalid or expired Link.
        </Alert>
      </Box>
    );
  }


  return (
    <>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            width: { xs: "90%", sm: "400px", md: "450px" },
            display: "flex",
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
          <Typography
            variant="h5"
            sx={{ fontWeight: "bold", color: "#333", textAlign: "center" }}
          >
            Candidate Login
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

          <TextField
            sx={{ width: "100%" }}
            id="password"
            type={showPassword ? "text" : "password"}
            label="Password"
            variant="outlined"
            placeholder="Your password"
            {...register("password", { required: "Password is required" })}
            error={!!errors.password || !!existError}
            helperText={errors.password?.message || existError}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={togglePasswordVisibility}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
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
            disabled={loading}
          >
            {loading ? (
                    <CircularProgress size={24} sx={{ color: "white" }} />
                  ) : (
                    "Sign in"
                  )}
          </Button>
        </Box>
        
    </>
  );
};

export default CandidateLogin;

import {
  Box,
  Button,
  TextField,
  Typography,
  InputAdornment,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
} from "@mui/material";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import { register as registerCandidate } from "../Services/adminService";

type FormValues = {
  name: string;
  email: string;
  mobile: string;
  degree: string;
  department: string;
  degree_percentage: number;
  sslc_percentage: number;
  hsc_percentage: number;
  location: string;
  relocate: boolean | null;
};

const CandidateRegistrationPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    control,
  } = useForm<FormValues>({
    defaultValues: {
      relocate: null,
    },
  });

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [mobileError, setMobileError] = useState("");

  const emailErr = watch("email");
  const mobileErr = watch("mobile");

  useEffect(() => {
    if (emailError) setEmailError("");
  }, [emailErr]);

  useEffect(() => {
    if (mobileError) setMobileError("");
  }, [mobileErr]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      await registerCandidate(
        data.name,
        data.email,
        data.mobile,
        data.degree,
        data.department,
        data.degree_percentage,
        data.sslc_percentage,
        data.hsc_percentage,
        data.location,
        data.relocate!
      );
      setFormSubmitted(true);
      reset();
    } catch (err: any) {
      if (err.error === "Email already exists") setEmailError(err.error);
      if (err.error === "Mobile number already exists") setMobileError(err.error);
    }
  };

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
      {formSubmitted ? (
        <Alert severity="success" sx={{ fontSize: "1rem" }}>
          Registration successful!
        </Alert>
      ) : (
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: "flex", flexDirection: "column", gap: "25px" }}
        >
          <Typography variant="h5" sx={{ fontWeight: "bold", color: "#333", textAlign: "center" }}>
            Candidate Registration
          </Typography>

          <TextField
            label="Name"
            {...register("name", { required: "Name is required" })}
            error={!!errors.name}
            helperText={errors.name?.message}
          />

          <TextField
            label="Email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                message: "Invalid email format",
              },
            })}
            error={!!errors.email || !!emailError}
            helperText={errors.email?.message || emailError}
          />

          <TextField
            label="Mobile"
            type="tel"
            InputProps={{
              startAdornment: <InputAdornment position="start">+91</InputAdornment>,
            }}
            {...register("mobile", {
              required: "Mobile number is required",
              pattern: {
                value: /^[6-9]\d{9}$/,
                message: "Enter valid 10-digit mobile number",
              },
            })}
            error={!!errors.mobile || !!mobileError}
            helperText={errors.mobile?.message || mobileError}
          />

          <TextField
            label="Degree"
            {...register("degree", { required: "Degree is required" })}
            error={!!errors.degree}
            helperText={errors.degree?.message}
          />

          <TextField
            label="Department"
            {...register("department", { required: "Department is required" })}
            error={!!errors.department}
            helperText={errors.department?.message}
          />

          <TextField
            label="Degree Percentage"
            type="number"
            inputProps={{ min: 0, max: 100, step: 0.01 }}
            {...register("degree_percentage", {
              required: "Degree percentage is required",
              min: { value: 0, message: "Minimum is 0%" },
              max: { value: 100, message: "Maximum is 100%" },
              validate: (value) =>
                !value.toString().includes("%") || "Do not include % symbol",
            })}
            error={!!errors.degree_percentage}
            helperText={errors.degree_percentage?.message}
          />

          <TextField
            label="SSLC Percentage"
            type="number"
            inputProps={{ min: 0, max: 100, step: 0.01 }}
            {...register("sslc_percentage", {
              required: "SSLC percentage is required",
              min: { value: 0, message: "Minimum is 0%" },
              max: { value: 100, message: "Maximum is 100%" },
              validate: (value) =>
                !value.toString().includes("%") || "Do not include % symbol",
            })}
            error={!!errors.sslc_percentage}
            helperText={errors.sslc_percentage?.message}
          />

          <TextField
            label="HSC Percentage"
            type="number"
            inputProps={{ min: 0, max: 100, step: 0.01 }}
            {...register("hsc_percentage", {
              required: "HSC percentage is required",
              min: { value: 0, message: "Minimum is 0%" },
              max: { value: 100, message: "Maximum is 100%" },
              validate: (value) =>
                !value.toString().includes("%") || "Do not include % symbol",
            })}
            error={!!errors.hsc_percentage}
            helperText={errors.hsc_percentage?.message}
          />

          <TextField
            label="Location"
            {...register("location", { required: "Location is required" })}
            error={!!errors.location}
            helperText={errors.location?.message}
          />

          <Typography sx={{ fontWeight: "500" }}>
            Are you ready to relocate to Kovilpatti?
          </Typography>

          <Controller
            name="relocate"
            control={control}
            rules={{ required: "Please choose an option" }}
            render={({ field }) => (
              <RadioGroup row {...field}>
                <FormControlLabel value="true" control={<Radio />} label="Yes" />
                <FormControlLabel value="false" control={<Radio />} label="No" />
              </RadioGroup>
            )}
          />
          {errors.relocate && (
            <Typography color="error" fontSize="0.875rem">
              {errors.relocate.message}
            </Typography>
          )}

          <Button type="submit" variant="contained" fullWidth>
            Register
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default CandidateRegistrationPage;

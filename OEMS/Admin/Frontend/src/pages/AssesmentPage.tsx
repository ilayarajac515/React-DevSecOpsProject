import {
  Box,
  Typography,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Button,
  Container,
  Alert,
} from "@mui/material";
import { useEffect, useState, useCallback, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import AgreeToTermsDialog from "../components/AgreeToTermsDialog";
import {
  useGetFieldsByCandidateFormIdQuery,
  useGetFormByIdQuery,
} from "../modules/admin_slice";
import { useParams } from "react-router-dom";
 
const AssessmentPage = () => {
  const { formId } = useParams();
  const [fields, setFields] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { data } = useGetFieldsByCandidateFormIdQuery(formId ?? "");
  const { data: formData } = useGetFormByIdQuery(formId ?? "");
 
  const savedAnswers = localStorage.getItem(`answers_${formId}`);
  const initialData = savedAnswers ? JSON.parse(savedAnswers) : {};
 
  const { register, handleSubmit, control, watch } = useForm({
    defaultValues: initialData,
  });
 
  const getInitialTimeLeft = () => {
    const saved = localStorage.getItem(`timer_${formId}`);
    return saved ? parseInt(saved) : null;
  };
 
  const [timeLeft, setTimeLeft] = useState<number | null>(getInitialTimeLeft);
  const [submitted, setSubmitted] = useState<boolean | null>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
 
  // Sync form state to localStorage on change
  const watchedValues = watch();
  useEffect(() => {
    if (Object.keys(watchedValues).length > 0) {
      localStorage.setItem(`answers_${formId}`, JSON.stringify(watchedValues));
    }
  }, [watchedValues, formId]);
 
  // Initialize fields and check terms
  useEffect(() => {
    if (data) {
      setFields(data);
    }
    const agreed = localStorage.getItem("termsAccepted");
    if (agreed === "true") {
      setOpenDialog(false);
    }
  }, [data]);
 
  // Start timer after agreement
  useEffect(() => {
    if (openDialog || !formData?.duration) return;
  
    let endTime = localStorage.getItem(`endTime_${formId}`);
  
    if (!endTime) {
      const durationInMs = parseInt(formData.duration) * 60 * 1000;
      const newEndTime = Date.now() + durationInMs;
      localStorage.setItem(`endTime_${formId}`, newEndTime.toString());
      endTime = newEndTime.toString();
    }
  
    const calculateTimeLeft = () => {
      const now = Date.now();
      const remaining = parseInt(endTime!) - now;
      return Math.max(0, Math.floor(remaining / 1000)); // seconds
    };
  
    setTimeLeft(calculateTimeLeft());
  
    timerRef.current = setInterval(() => {
      const remainingSeconds = calculateTimeLeft();
  
      if (remainingSeconds <= 0) {
        clearInterval(timerRef.current!);
        localStorage.removeItem(`endTime_${formId}`);
        alert("Time's up!");
        handleSubmit(onSubmit)();
        setTimeLeft(0);
      } else {
        setTimeLeft(remainingSeconds);
      }
    }, 1000);
  
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [openDialog, formData]);
  
  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "Loading...";
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };
 
  const handleAgree = useCallback(() => {
    if (termsAccepted) {
      localStorage.setItem("termsAccepted", "true");
      setOpenDialog(false);
    } else {
      alert("Please accept the terms to continue.");
    }
  }, [termsAccepted]);
 
  const handleTermsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTermsAccepted(event.target.checked);
  };
 
  const onSubmit = (data: any) => {
    const result: Record<string, any> = {};
 
    fields.forEach((field, index) => {
      if (field.type === "rta") {
        const questionsAndAnswers = field.rta?.questions?.map(
          (question: string, qIndex: number) => ({
            question,
            answer: data[`field_${index}_question_${qIndex}`],
          })
        );
        result[field.label] = questionsAndAnswers;
      } else {
        result[field.label] = data[`field_${index}`];
      }
    });
 
    console.log("Formatted data:", result);
    setSubmitted(true);
    // Send to DB logic goes here...
 
    // Clear localStorage after submission
    localStorage.removeItem(`endTime_${formId}`);
    localStorage.removeItem(`answers_${formId}`);
    localStorage.removeItem(`timer_${formId}`);
  };
 
  const toRoman = (num: number) => {
    const romanNumerals: string[] = [
      "i",
      "ii",
      "iii",
      "iv",
      "v",
      "vi",
      "vii",
      "viii",
      "ix",
      "x",
      "xi",
      "xii",
      "xiii",
      "xiv",
      "xv",
      "xvi",
      "xvii",
      "xviii",
      "xix",
      "xx",
    ];
    return romanNumerals[num - 1] || num.toString();
  };
 
  if (openDialog) {
    return (
      <AgreeToTermsDialog
        open={openDialog}
        onClose={() => {}}
        onAgree={handleAgree}
        termsAccepted={termsAccepted}
        handleTermsChange={handleTermsChange}
      />
    );
  }
 
  return (
    <Container maxWidth="md">
      {submitted ? (
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
        <Alert severity="success" sx={{ width: "100%" }}>
          {"Test Successfully submitted"}
        </Alert>
        </Box>
      ) : (
        <>
          <Box
            sx={{
              position: "fixed",
              top: { xs: 10, sm: 20, md: 65 },
              right: { xs: 10, sm: 20 },
              backgroundColor: "red",
              color: "#fff",
              px: { xs: 2, sm: 3 },
              py: { xs: 1, sm: 1.5 },
              borderRadius: "8px",
              zIndex: 9999,
              fontWeight: "bold",
              fontSize: { xs: "0.9rem", sm: "1rem" },
              boxShadow: 3,
              maxWidth: "90vw",
              textAlign: "center",
            }}
          >
            Time Left: {formatTime(timeLeft)}
          </Box>
 
          <Box
            p={4}
            mt={{ xs: 8, sm: 0 }}
            sx={{ backgroundColor: "#f9f9f9", borderRadius: 2 }}
            component="form"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Assessment
            </Typography>
 
            <Divider sx={{ my: 2 }} />
 
            {fields.map((field, index) => (
              <Box key={field.id || index} my={3}>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  {index + 1}. {field.label}
                </Typography>
 
                {field.type === "text" ? (
                  <TextField
                    type="text"
                    placeholder={field.placeholder || ""}
                    fullWidth
                    variant="outlined"
                    size="small"
                    {...register(`field_${index}`)}
                  />
                ) : field.type === "textArea" ? (
                  <TextField
                    placeholder={field.placeholder || ""}
                    fullWidth
                    multiline
                    rows={10}
                    variant="outlined"
                    size="small"
                    {...register(`field_${index}`)}
                  />
                ) : field.type === "radio" ? (
                  <Controller
                    name={`field_${index}`}
                    control={control}
                    defaultValue=""
                    render={({ field: radioField }) => (
                      <RadioGroup {...radioField}>
                        {(Array.isArray(field.options)
                          ? field.options
                          : []
                        ).map((opt: string, idx: number) => (
                          <FormControlLabel
                            key={idx}
                            value={opt}
                            control={<Radio />}
                            label={opt}
                          />
                        ))}
                      </RadioGroup>
                    )}
                  />
                ) : field.type === "rta" ? (
                  <Box>
                    <Box
                      className="ck-content"
                      sx={{
                        backgroundColor: "white",
                        border: "1px solid #ddd",
                        borderRadius: "5px",
                        overflowX: "auto",
                        marginBottom: "20px",
                      }}
                      dangerouslySetInnerHTML={{
                        __html: field.rta?.content || "",
                      }}
                    />
                    {field.rta?.questions?.length > 0 && (
                      <Box sx={{ paddingX: "16px" }}>
                        {field.rta.questions.map(
                          (question: string, qIndex: number) => (
                            <Box key={qIndex} sx={{ marginBottom: "16px" }}>
                              <Typography variant="body1" fontWeight="bold">
                                {toRoman(qIndex + 1)}. {question}
                              </Typography>
                              <TextField
                                placeholder={`Your answer for ${toRoman(
                                  qIndex + 1
                                )}`}
                                fullWidth
                                multiline
                                rows={3}
                                variant="outlined"
                                size="small"
                                {...register(
                                  `field_${index}_question_${qIndex}`
                                )}
                              />
                            </Box>
                          )
                        )}
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Unsupported field type
                  </Typography>
                )}
              </Box>
            ))}
 
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button variant="contained" color="success" type="submit">
                Submit
              </Button>
            </Box>
          </Box>
        </>
      )}
    </Container>
  );
};
 
export default AssessmentPage;
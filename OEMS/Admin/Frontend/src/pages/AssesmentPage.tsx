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
  useAddSubmissionMutation,
  useEditSubmissionMutation,
  useGetCandidateSubmissionQuery,
  useGetFieldsByCandidateFormIdQuery,
  useGetFormByIdQuery,
} from "../modules/candidate_slice";
import { useParams } from "react-router-dom";
import { useLogoutCandidateMutation } from "../modules/candidate_slice";
import { v4 as uuid } from "uuid";
import { useCandidate } from "../context/CandidateContext";

const AssessmentPage = () => {
  const { email ,setAuth } = useCandidate();
  
  const { formId } = useParams();
  const [fields, setFields] = useState<any[]>([]);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { data: candidateData } = useGetCandidateSubmissionQuery(email ?? "");
  const { data } = useGetFieldsByCandidateFormIdQuery(formId ?? "");
  const { data: formData } = useGetFormByIdQuery(formId ?? "");
  const [logoutCandidate] = useLogoutCandidateMutation();
  const [startSubmit] = useAddSubmissionMutation();
  const [endSubmit] = useEditSubmissionMutation();
  const savedAnswers = localStorage.getItem(`answers_${formId}`);
  const initialData = savedAnswers ? JSON.parse(savedAnswers) : {};

  const { register, handleSubmit, control, watch } = useForm({
    defaultValues: initialData,
  });

  const getInitialTimeLeft = () => {
    const saved = localStorage.getItem(`timer_${formId}`);
    return saved ? parseInt(saved) : null;
  };
  const handleLogout = async () => {
    try {
      await logoutCandidate().unwrap();
      localStorage.removeItem("candidateToken");
      setAuth({ email:null , authorized:null});
    } catch (err) {
      console.error("Logout failed", err);
    }
  };
  const [timeLeft, setTimeLeft] = useState<number | null>(getInitialTimeLeft);
  const [submitted, setSubmitted] = useState<boolean | null>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const watchedValues = watch();
  useEffect(() => {
    if (Object.keys(watchedValues).length > 0) {
      localStorage.setItem(`answers_${formId}`, JSON.stringify(watchedValues));
    }
  }, [watchedValues, formId]);

  useEffect(() => {
    if (openDialog || !formData?.duration || !candidateData?.startTime) return;
  
    const startTimeMs = new Date(candidateData.startTime).getTime();
    const durationMs = parseInt(formData.duration) * 60 * 1000;
    const endTime = startTimeMs + durationMs;
  
    const calculateTimeLeft = () => {
      const now = Date.now();
      const remaining = endTime - now;
      return Math.max(0, Math.floor(remaining / 1000)); // seconds
    };
  
    setTimeLeft(calculateTimeLeft());
  
    timerRef.current = setInterval(() => {
      const remainingSeconds = calculateTimeLeft();
  
      if (remainingSeconds <= 0) {
        clearInterval(timerRef.current!);
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
  }, [openDialog, formData, candidateData]);
  
  
  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "Loading...";
    const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };
  
  const handleAgree = useCallback(async () => {
    if (termsAccepted) {
      const now = new Date().toISOString();
      setStartTime(now);
      localStorage.setItem("termsAccepted", "true");
      localStorage.setItem(`startTime_${formId}`, now);
      
      await startSubmit({
        formId: formId ?? "",
        data: {
          termsAccepted: "true",
          ip: "",
          userEmail: email ?? "",
          startTime: now,
          responseId: uuid(),
        },
      }).unwrap();
      setOpenDialog(false);
    } else {
      alert("Please accept the terms to continue.");
    }
  }, [termsAccepted, formId, startSubmit]);

  useEffect(() => {
    if (data) {
      setFields(data);
    }
    if (candidateData?.termsAccepted === "true") {
      setOpenDialog(false);
    }
  }, [data, candidateData]);

  const handleTermsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTermsAccepted(event.target.checked);
  };
  
  const onSubmit = async (data: any) => {
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
    await endSubmit({
      formId: formId ?? "",
      userEmail: email ?? "",
      status:"submitted",
      value: result,
    }).unwrap();
    setSubmitted(true);
    handleLogout();
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
  
  if (openDialog && candidateData?.termsAccepted !== "true") {
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
              top: { xs: 155 , sm: 20, md: 100 },
              right: { xs: 50, sm: 20 },
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

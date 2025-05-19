import { useEffect, useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  useAddSubmissionMutation,
  useEditSubmissionMutation,
  useGetCandidateSubmissionQuery,
  useGetFieldsByCandidateFormIdQuery,
  useGetFormByIdQuery,
  useGetStartTimeQuery,
  useUpdateTimerMutation,
} from "../modules/candidate_slice";
import { useParams } from "react-router-dom";
import { useLogoutCandidateMutation } from "../modules/candidate_slice";
import { v4 as uuid } from "uuid";
import { useCandidate } from "../context/CandidateContext";
import { toast } from "react-toastify";
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
} from "@mui/material";
import AgreeToTermsDialog from "../components/AgreeToTermsDialog";
import { TimerButton } from "../components/TimerButton";
import ConfirmationDialog from "../components/ConfirmationDialog";

const AssessmentPage = () => {
  const { email, setAuth } = useCandidate();
  const { formId } = useParams();
  const { data: fields, isLoading: isFieldsLoading } =
    useGetFieldsByCandidateFormIdQuery(formId ?? "");
  const { data: formData, isLoading: isFormLoading } = useGetFormByIdQuery(
    formId ?? ""
  );
  const [logoutCandidate] = useLogoutCandidateMutation();
  const [endSubmit] = useEditSubmissionMutation();
  const [startSubmit, { data: submissionResponse }] =
    useAddSubmissionMutation();
  const [updateTimer] = useUpdateTimerMutation();
  const [openDialog, setOpenDialog] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [expired, setExpired] = useState(false);
  const [elapsedTime, setElapsedTime] = useState("00:00");

  const submissionId = localStorage.getItem("responseId");
  const { data: candidateData } = useGetCandidateSubmissionQuery(
    {
      responseId: submissionId ?? "",
      formId: formId ?? "",
    },
    { skip: !submissionId }
  );
  const { data: startTimeData } = useGetStartTimeQuery({
    formId: formId,
    responseId: submissionId,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { register, handleSubmit, control } = useForm();

  useEffect(() => {
    if (submissionResponse?.responseId) {
      localStorage.setItem("responseId", submissionResponse.responseId);
    }
  }, [submissionResponse]);

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!formData?.duration || !startTimeData?.startTime || !candidateData)
      return;

    const durationMs = Number(formData.duration) * 60 * 1000;
    const [startHour, startMinute, startSecond] = startTimeData.startTime
      .split(":")
      .map(Number);
    const startTime = new Date();
    startTime.setHours(startHour, startMinute, startSecond, 0);

    const now = Date.now();
    const elapsedMs = now - startTime.getTime();
    const remainingMs = durationMs - elapsedMs;

    if (remainingMs <= 0 && candidateData.status !== "submitted") {
      setExpired(true);
      handleSubmitAssessment();
    }
  }, [formData, startTimeData, candidateData]);

  useEffect(() => {
    if (
      !formData?.duration ||
      !startTimeData?.startTime ||
      expired ||
      candidateData?.status === "submitted"
    )
      return;

    const durationMs = Number(formData.duration) * 60 * 1000;
    const [startHour, startMinute, startSecond] = startTimeData.startTime
      .split(":")
      .map(Number);
    const startTime = new Date();
    startTime.setHours(startHour, startMinute, startSecond, 0);

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedMs = now - startTime.getTime();
      let remainingMs = durationMs - elapsedMs;

      if (remainingMs <= 0) {
        remainingMs = 0;
        setElapsedTime("00:00");
        setExpired(true);
        clearInterval(interval);
        handleSubmitAssessment();
        return;
      }

      setElapsedTime(formatDuration(remainingMs));

      updateTimer({
        formId: candidateData?.formId ?? "",
        userEmail: candidateData?.userEmail ?? "",
        Timer: formatDuration(remainingMs),
      });
    }, 1000);

    const initialElapsedMs = Date.now() - startTime.getTime();
    const initialRemainingMs = Math.max(durationMs - initialElapsedMs, 0);
    setElapsedTime(formatDuration(initialRemainingMs));

    return () => clearInterval(interval);
  }, [formData?.duration, startTimeData?.startTime, candidateData, expired]);

  useEffect(() => {
    if (candidateData?.termsAccepted === "true") {
      setOpenDialog(false);
    }
  }, [candidateData]);

  const handleAgree = useCallback(async () => {
    if (!termsAccepted) {
      toast.error("Please accept the terms to continue.");
      return;
    }

    const now = new Date();
    const formattedTime = now.toLocaleTimeString("en-GB", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    try {
      await startSubmit({
        formId: formId ?? "",
        data: {
          termsAccepted: "true",
          userEmail: email ?? "",
          startTime: formattedTime,
          responseId: uuid(),
        },
      }).unwrap();
      setOpenDialog(false);
    } catch (err) {
      console.error("Failed to record start time", err);
      toast.error("Failed to start assessment.");
    }
  }, [termsAccepted, formId, startSubmit, email]);

  const handleLogout = async () => {
    try {
      await logoutCandidate().unwrap();
      localStorage.removeItem("candidateToken");
      localStorage.removeItem("responseId");
      setAuth({ email: null, authorized: null });
    } catch (err) {
      console.error("Logout failed", err);
      toast.error("Logout failed.");
    }
  };

  const handleSubmitAssessment = () => {
    setDeleteDialogOpen(false);
    handleSubmit(onSubmit)();
  };

  const onSubmit = async (data: any) => {
    try {
      const result: Record<string, any> = {};
      (fields || []).forEach((field, index) => {
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

      const now = new Date();
      const [startHour, startMinute, startSecond] = (
        startTimeData?.startTime || "00:00:00"
      )
        .split(":")
        .map(Number);
      const actualStartTime = new Date();
      actualStartTime.setHours(startHour, startMinute, startSecond, 0);
      const durationMinutes = Number(formData?.duration);
      const allowedDurationMs = durationMinutes * 60 * 1000;
      const actualTimeTakenMs = now.getTime() - actualStartTime.getTime();

      if (
        actualTimeTakenMs > allowedDurationMs + 1000 &&
        candidateData?.status !== "submitted"
      ) {
        toast.error("Time limit exceeded. You are being logged out.");
        handleLogout();
        return;
      }

      const formattedTime = now.toLocaleTimeString("en-GB", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      const totalSeconds = Math.floor(actualTimeTakenMs / 1000);
      const totalMinutes = Math.floor(totalSeconds / 60);
      const remainingSeconds = totalSeconds % 60;
      const calculatedDuration = `${totalMinutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;

      await endSubmit({
        formId: candidateData?.formId ?? "",
        userEmail: candidateData?.userEmail ?? "",
        status: "submitted",
        endTime: formattedTime,
        duration: calculatedDuration,
        value: result,
      }).unwrap();

      toast.success("Test submitted successfully.");
      handleLogout();
    } catch (err) {
      console.error("Failed to submit test", err);
      toast.error("Submission failed. Please try again.");
    }
  };

  const toRoman = (num: number) => {
    const romanNumerals = [
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

  if (
    isFieldsLoading ||
    isFormLoading ||
    !fields ||
    !formData ||
    expired ||
    candidateData?.status === "submitted"
  ) {
    return null;
  }

  if (openDialog && candidateData?.termsAccepted !== "true") {
    return (
      <AgreeToTermsDialog
        open={openDialog}
        onClose={() => {}}
        onAgree={handleAgree}
        termsAccepted={termsAccepted}
        handleTermsChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          setTermsAccepted(event.target.checked)
        }
      />
    );
  }

  return (
    <Container maxWidth="md">
      <TimerButton elapsedTime={elapsedTime} />
      <Box
        p={4}
        mt={{ xs: 8, sm: 0, md: 7 }}
        sx={{ backgroundColor: "#f9f9f9", borderRadius: 2 }}
        component="form"
        onSubmit={(e) => e.preventDefault()}
      >
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Assessment
        </Typography>
        <Divider sx={{ my: 2 }} />
        {fields.map((field, index) => (
          <Box key={field.fieldId || index} my={3}>
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
                    {(Array.isArray(field.options) ? field.options : []).map(
                      (opt: string, idx: number) => (
                        <FormControlLabel
                          key={idx}
                          value={opt}
                          control={<Radio />}
                          label={opt}
                        />
                      )
                    )}
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
                  dangerouslySetInnerHTML={{ __html: field.rta?.content || "" }}
                />
                {(field.rta?.questions || []).map(
                  (question: string, qIndex: number) => (
                    <Box key={qIndex} sx={{ marginBottom: "16px" }}>
                      <Typography variant="body1" fontWeight="bold">
                        {toRoman(qIndex + 1)}. {question}
                      </Typography>
                      <TextField
                        placeholder={`Your answer for ${toRoman(qIndex + 1)}`}
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        size="small"
                        {...register(`field_${index}_question_${qIndex}`)}
                      />
                    </Box>
                  )
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
          <Button
            variant="contained"
            color="success"
            type="button"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={expired}
          >
            Submit
          </Button>
        </Box>
      </Box>
      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onDelete={handleSubmitAssessment}
        itemLabel="the test"
        confirmLabel="Submit"
        title="Submit Test"
        description="Are you sure you want to submit your test now?"
      />
    </Container>
  );
};

export default AssessmentPage;

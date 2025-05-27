import {
  Box,
  Typography,
  Divider,
  Container,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Button,
} from "@mui/material";
import {
  useGetFieldsByFormIdQuery,
  useGetSubmissionByEmailQuery,
} from "../modules/admin_slice";
import { useGetFormByIdQuery } from "../modules/candidate_slice";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useState } from "react";
 
const toRoman = (num: number) => {
  const romanNumerals: string[] = [
    "i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x",
    "xi", "xii", "xiii", "xiv", "xv", "xvi", "xvii", "xviii", "xix", "xx"
  ];
  return romanNumerals[num - 1] || num.toString();
};
 
const ExamineeAnswerPage = () => {
  const { examineeFormId: formId, email } = useParams();
  const { data: userAnswers, isLoading: isUserAnswersLoading } =
    useGetSubmissionByEmailQuery({ formId: formId ?? "", email: email ?? "" });
  const { data: formData, isLoading: isFormLoading } = useGetFormByIdQuery(formId ?? "");
  const { data: assessmentData, isLoading: isAssessmentLoading } =
    useGetFieldsByFormIdQuery(formId ?? "");
 
  const [evaluationResult, setEvaluationResult] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
 
  const formatted = assessmentData
    ?.map((q: any) => {
      const answer = userAnswers?.value?.[q.label];
      if (!answer) return "";
      if (Array.isArray(answer)) {
        const subAnswers = answer
          .map((sub: any, index: number) => {
            const qText = sub?.question || `Sub-question ${index + 1}`;
            const aText = sub?.answer || "No answer";
            return `${toRoman(index + 1)}. ${qText}\n   Ans: ${aText}`;
          })
          .join("\n");
        return `Q: ${q.label}\n${subAnswers}\n`;
      }
      return `Q: ${q.label}\nA: ${answer}\n`;
    })
    .filter(Boolean)
    .join("\n");
 
  const handleCopy = () => {
    if (!formatted) {
      toast.error("Nothing to copy");
      return;
    }
    navigator.clipboard.writeText(formatted).then(
      () => toast.success("Answers copied to clipboard!"),
      () => toast.error("Failed to copy answers.")
    );
  };
 
  const evaluateAnswer = async () => {
    if (!formatted) {
      toast.error("No answers available to evaluate.");
      return;
    }
 
    setIsEvaluating(true);
    setEvaluationResult("");
 
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer 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",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-prover-v2:free",
          messages: [
            {
              role: "user",
              content: `${formData?.description}\n\n${formatted}`,
            },
          ],
        }),
      });
 
      const data = await response.json();
      const evalText = data.choices?.[0]?.message?.content || "No evaluation response.";
      setEvaluationResult(evalText);
    } catch (error) {
      console.error(error);
      toast.error("Failed to evaluate answer.");
    } finally {
      setIsEvaluating(false);
    }
  };
 
  if (
    isUserAnswersLoading ||
    isFormLoading ||
    isAssessmentLoading ||
    !userAnswers ||
    !formData ||
    !assessmentData
  ) return null;
 
  if (!userAnswers.value) {
    return (
      <Container maxWidth="lg">
        <Box p={4} mt={4} sx={{ backgroundColor: "#f9f9f9", borderRadius: 2 }}>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            {formData.label} Assessment
          </Typography>
          <Typography variant="body1" color="error">
            No answers found for this submission.
          </Typography>
        </Box>
      </Container>
    );
  }
 
  return (
    <Container maxWidth="md">
      <Box p={4} mt={4} sx={{ backgroundColor: "#f9f9f9", borderRadius: 2 }} component="form" onSubmit={(e) => e.preventDefault()}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
          <Button variant="outlined" onClick={handleCopy}>
            Copy All Answers
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={evaluateAnswer}
            disabled={isEvaluating}
          >
            {isEvaluating ? "Evaluating..." : "Evaluate Answers"}
          </Button>
        </Box>
 
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            {formData.label} Assessment
          </Typography>
          <Typography variant="h6" fontWeight="bold">
            {userAnswers.userEmail}
          </Typography>
        </Box>
 
        <Divider sx={{ my: 2 }} />
 
        {assessmentData.map((question, index) => {
          const userAnswer = userAnswers.value[question.label];
          return (
            <Box key={question.fieldId} mb={4}>
              <Typography variant="h6" gutterBottom>
                {index + 1}. {question.label}
              </Typography>
 
              {question.type === "text" && (
                <TextField
                  fullWidth
                  value={userAnswer || ""}
                  placeholder={question.placeholder}
                  variant="outlined"
                  InputProps={{ readOnly: true }}
                />
              )}
 
              {question.type === "textArea" && (
                <>
                  {question.textArea?.content && (
                    <Box
                      className="ck-content"
                      sx={{
                        backgroundColor: "white",
                        border: "1px solid #ddd",
                        borderRadius: "5px",
                        overflowX: "auto",
                        mb: 2,
                      }}
                      dangerouslySetInnerHTML={{ __html: question.textArea.content }}
                    />
                  )}
                  <TextField
                    rows={10}
                    multiline
                    value={userAnswer || ""}
                    placeholder={question.placeholder}
                    fullWidth
                    variant="outlined"
                    InputProps={{ readOnly: true }}
                  />
                </>
              )}
 
              {question.type === "radio" && question.options && (
                <FormControl component="fieldset">
                  <RadioGroup value={userAnswer || ""}>
                    {question.options.map((option: any, index: number) => (
                      <FormControlLabel
                        key={index}
                        value={option}
                        control={<Radio />}
                        label={option}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              )}
 
              {question.type === "rta" && (
                <Box>
                  <Box
                    className="ck-content"
                    sx={{
                      backgroundColor: "white",
                      border: "1px solid #ddd",
                      borderRadius: "5px",
                      overflowX: "auto",
                      mb: 2,
                      p: 2,
                    }}
                    dangerouslySetInnerHTML={{
                      __html: question.rta?.content || "",
                    }}
                  />
                  {(question.rta?.questions || []).map((subQuestion: any, qIndex: number) => (
                    <Box key={qIndex} sx={{ mb: 2 }}>
                      <Typography variant="body1" fontWeight="bold">
                        {toRoman(qIndex + 1)}. {subQuestion}
                      </Typography>
                      <TextField
                        value={
                          (Array.isArray(userAnswer) &&
                            userAnswer.find((ans: any) => ans.question === subQuestion)?.answer) ||
                          ""
                        }
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        size="small"
                        InputProps={{ readOnly: true }}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          );
        })}
 
        {evaluationResult && (
          <Box mt={3} p={2} sx={{ backgroundColor: "#e0f7fa", borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Evaluation Result:
            </Typography>
            <Typography variant="body1" whiteSpace="pre-wrap">
              {evaluationResult}
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};
 
export default ExamineeAnswerPage;
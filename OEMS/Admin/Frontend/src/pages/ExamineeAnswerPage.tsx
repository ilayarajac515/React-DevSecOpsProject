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
} from "@mui/material";
import {
  useGetFieldsByFormIdQuery,
  useGetSubmissionByEmailQuery,
} from "../modules/admin_slice";
import { useParams } from "react-router-dom";
import { useGetFormByIdQuery } from "../modules/candidate_slice";

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

const ExamineeAnswerPage = () => {
  const { examineeFormId: formId, email } = useParams();
  const { data: userAnswers } = useGetSubmissionByEmailQuery({
    formId: formId ?? "",
    email: email ?? "",
  });
  const { data: formData } = useGetFormByIdQuery(formId ?? "");
  const { data: assessmentData } = useGetFieldsByFormIdQuery(formId ?? "");

  return (
    <Container maxWidth="md">
      <Box
        p={4}
        mt={{ xs: 8, sm: 0, md: 4 }}
        sx={{backgroundColor: "#f9f9f9",  borderRadius: 2 }}
        component="form"
        onSubmit={(e) => e.preventDefault()}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h4" gutterBottom fontWeight="bold">
            {formData?.label} Assessment
          </Typography>
          <Typography gutterBottom variant="h6" fontWeight="bold">
            {userAnswers?.userEmail}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {assessmentData?.map((question) => {
          const userAnswer = userAnswers?.value[question.label];
          return (
            <Box key={question.fieldId} mb={4}>
              <Typography variant="h6" gutterBottom>
                {question.label}
              </Typography>

              {question.type === "text" && (
                <TextField
                  fullWidth
                  value={userAnswer || ""}
                  placeholder={question.placeholder}
                  variant="outlined"
                />
              )}

              {question.type === "textArea" && (
                <TextField
                  rows={10}
                  multiline
                  value={userAnswer || ""}
                  placeholder={question.placeholder}
                  fullWidth
                />
              )}

              {question.type === "radio" && question.options && (
                <FormControl component="fieldset">
                  <RadioGroup value={userAnswer || ""} row>
                    {question.options.length > 0 ? (
                      question.options.map((option: any, index: number) => (
                        <FormControlLabel
                          key={index}
                          value={option}
                          control={<Radio />}
                          label={option}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No options available
                      </Typography>
                    )}
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
                      marginBottom: "20px",
                    }}
                    dangerouslySetInnerHTML={{
                      __html: question.rta?.content || "",
                    }}
                  />

                  {(question.rta?.questions || []).map(
                    (subQuestion: any, qIndex: number) => (
                      <Box key={qIndex} sx={{ marginBottom: "16px" }}>
                        <Typography variant="body1" fontWeight="bold">
                          {toRoman(qIndex + 1)}. {subQuestion}
                        </Typography>

                        <TextField
                          value={
                            userAnswer?.find(
                              (answer: any) => answer.question === subQuestion
                            )
                              ? userAnswer.find(
                                  (answer: any) =>
                                    answer.question === subQuestion
                                )?.answer
                              : ""
                          }
                          fullWidth
                          multiline
                          rows={3}
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                    )
                  )}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Container>
  );
};

export default ExamineeAnswerPage;

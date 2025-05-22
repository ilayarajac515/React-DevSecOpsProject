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
    const { data: userAnswers, isLoading: isUserAnswersLoading } =
      useGetSubmissionByEmailQuery({
        formId: formId ?? "",
        email: email ?? "",
      });
    const { data: formData, isLoading: isFormLoading } = useGetFormByIdQuery(
      formId ?? ""
    );
    const { data: assessmentData, isLoading: isAssessmentLoading } =
      useGetFieldsByFormIdQuery(formId ?? "");

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
        () => {
          toast.success("Answers copied to clipboard!");
        },
        () => {
          toast.error("Failed to copy answers.");
        }
      );
    };

    if (
      isUserAnswersLoading ||
      isFormLoading ||
      isAssessmentLoading ||
      !userAnswers ||
      !formData ||
      !assessmentData
    ) {
      return null;
    }

    if (!userAnswers.value) {
      return (
        <Container maxWidth="lg">
          <Box
            p={{ xs: 2, sm: 3, md: 4 }}
            mt={{ xs: 2, sm: 0, md: 4 }}
            sx={{ backgroundColor: "#f9f9f9", borderRadius: 2 }}
          >
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
        <Box
          p={{ xs: 2, sm: 3, md: 4 }}
          mt={{ xs: 2, sm: 0, md: 4 }}
          sx={{ backgroundColor: "#f9f9f9", borderRadius: 2 }}
          component="form"
          onSubmit={(e) => e.preventDefault()}
        >
          <Button
            variant="outlined"
            onClick={handleCopy}
            sx={{ mb: 3, width: { xs: "100%", sm: "auto" } }}
          >
            Copy All Answers
          </Button>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              gap: 2,
            }}
          >
            <Typography
              variant="h4"
              gutterBottom
              fontWeight="bold"
              sx={{ fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" } }}
            >
              {formData.label} Assessment
            </Typography>
            <Typography
              gutterBottom
              variant="h6"
              fontWeight="bold"
              sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
            >
              {userAnswers.userEmail}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {assessmentData.map((question, index) => {
            const userAnswer = userAnswers.value[question.label];
            return (
              <Box key={question.fieldId} mb={4}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                >
                  {index + 1}. {question.label}
                </Typography>

                {question.type === "text" && (
                  <TextField
                    fullWidth
                    value={userAnswer || ""}
                    placeholder={question.placeholder}
                    variant="outlined"
                    InputProps={{ readOnly: true }}
                    sx={{
                      "& .MuiInputBase-input": {
                        fontSize: { xs: "0.9rem", sm: "1rem" },
                      },
                    }}
                  />
                )}

                {question.type === "textArea" && (
                  <>
                    { question.textArea?.content &&  (<Box
                    className="ck-content"
                    sx={{
                      backgroundColor: "white",
                      border: "1px solid #ddd",
                      borderRadius: "5px",
                      overflowX: "auto",
                      marginBottom: "20px",
                    }}
                    dangerouslySetInnerHTML={{ __html: question.textArea?.content || "" }}
                  />) }
                    <TextField
                      rows={10}
                      multiline
                      value={userAnswer || ""}
                      placeholder={question.placeholder}
                      fullWidth
                      variant="outlined"
                      InputProps={{ readOnly: true }}
                      sx={{
                        "& .MuiInputBase-input": {
                          fontSize: { xs: "0.9rem", sm: "1rem" },
                        },
                      }}
                    />
                  </>
                )}

                {question.type === "radio" && question.options && (
                  <FormControl component="fieldset">
                    <RadioGroup
                      value={userAnswer || ""}
                      sx={{ flexDirection: { xs: "column" } }}
                    >
                      {question.options.length > 0 ? (
                        question.options.map((option: any, index: number) => (
                          <FormControlLabel
                            key={index}
                            value={option}
                            control={<Radio />}
                            label={option}
                            sx={{
                              "& .MuiFormControlLabel-label": {
                                fontSize: { xs: "0.9rem", sm: "1rem" },
                              },
                            }}
                          />
                        ))
                      ) : (
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
                        >
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
                        p: { xs: 1, sm: 2 },
                        fontSize: { xs: "0.9rem", sm: "1rem" },
                      }}
                      dangerouslySetInnerHTML={{
                        __html: question.rta?.content || "",
                      }}
                    />

                    {(question.rta?.questions || []).map(
                      (subQuestion: any, qIndex: number) => (
                        <Box key={qIndex} sx={{ marginBottom: "16px" }}>
                          <Typography
                            variant="body1"
                            fontWeight="bold"
                            sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
                          >
                            {toRoman(qIndex + 1)}. {subQuestion}
                          </Typography>

                          <TextField
                            value={
                              (Array.isArray(userAnswer) &&
                                userAnswer.find(
                                  (answer: any) => answer.question === subQuestion
                                )?.answer) ||
                              ""
                            }
                            fullWidth
                            multiline
                            rows={3}
                            variant="outlined"
                            size="small"
                            InputProps={{ readOnly: true }}
                            sx={{
                              "& .MuiInputBase-input": {
                                fontSize: { xs: "0.9rem", sm: "1rem" },
                              },
                            }}
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

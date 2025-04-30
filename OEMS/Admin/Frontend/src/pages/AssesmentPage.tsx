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
import { useEffect, useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import AgreeToTermsDialog from "../components/AgreeToTermsDialog";
import { useGetFieldsByFormIdQuery } from "../modules/form_slice";
import { useParams } from "react-router-dom";
import axios from "axios";

const AssessmentPage = () => {
  const [ip, setIP] = useState("");
  const getData = async () => {
    const res = await axios.get("https://api.ipify.org/?format=json");
    console.log(res.data);
    setIP(res.data.ip);
  };

  useEffect(() => {
    getData();
  }, []);

  const { formId } = useParams();
  const [fields, setFields] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { data } = useGetFieldsByFormIdQuery(formId ?? "");

  const { register, handleSubmit, control } = useForm();

  useEffect(() => {
    if (data) {
      setFields(data);
    }

    const agreed = localStorage.getItem("termsAccepted");
    if (agreed === "true") {
      setOpenDialog(false);
    }
  }, [data]);

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
      <Box
        p={4}
        sx={{ backgroundColor: "#f9f9f9", borderRadius: 2 }}
        component="form"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Dynamic Assessment
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
                    {(Array.isArray(field.options) ? field.options : [])?.map(
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
                            {...register(`field_${index}_question_${qIndex}`)}
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
    </Container>
  );
};

export default AssessmentPage;

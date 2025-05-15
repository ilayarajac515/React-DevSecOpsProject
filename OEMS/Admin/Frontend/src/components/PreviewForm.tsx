import {
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Container,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { useGetFieldsByFormIdQuery } from "../modules/admin_slice";

const PreviewForm = ({ form }: { form: any }) => {
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

  const { formId } = useParams();

  const actualFormId = form?.formId || formId || "";

  const { data: fields } = useGetFieldsByFormIdQuery(actualFormId);

  const { control } = useForm();

  return (
    <Container maxWidth="md">
      <Box
        p={4}
        sx={{ backgroundColor: "#f9f9f9", borderRadius: 2 }}
        component="form"
        onSubmit={(e) => e.preventDefault()}
      >

        {fields?.map((field, index) => (
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
              />
            ) : field.type === "textArea" ? (
              <TextField
                placeholder={field.placeholder || ""}
                fullWidth
                multiline
                rows={10}
                variant="outlined"
                size="small"
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
      </Box>
    </Container>
  );
};

export default PreviewForm;

import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
} from "@mui/material";
import { useForm, useFieldArray } from "react-hook-form";
import { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DataTable from "../components/DataTable";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
type Option = {
  value: string;
};

type FormValues = {
  type: string;
  label: string;
  typeToLabelOrientation: string;
  placeHolder: string;
  helpText: string;
  options: Option[];
};

const FormListingPage = () => {
  const [open, setOpen] = useState(false);

  const { register, handleSubmit, reset, watch, control } = useForm<FormValues>(
    {
      defaultValues: {
        options: [{ value: "" }],
      },
    }
  );

  const { fields, append, replace, remove } = useFieldArray({
    control,
    name: "options",
  });

  const selectedType = watch("type");

  const onSubmit = (data: FormValues) => {
    console.log("Submitted:", data);
    setOpen(false);
    reset();
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", marginTop: "30px" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          background: "white",
          border: "1px solid lightGray",
          padding: "20px",
          alignItems: "center",
          borderRadius: "10px",
        }}
      >
        <Typography sx={{ fontWeight: "bold" }}>Form Manager</Typography>
        <Button
          variant="contained"
          disableElevation
          onClick={() => setOpen(true)}
        >
          + Create Form
        </Button>
      </Box>

      <Box sx={{ marginTop: "30px" }}>
        <DataTable />
      </Box>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ marginBottom: "10px", fontWeight: "bold" }}>
          Create Field
        </DialogTitle>

        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              mt: 1,
            }}
          >
            <TextField
              select
              label="Type"
              fullWidth
              sx={{ marginTop: "10px" }}
              {...register("type")}
            >
              <MenuItem value="text">Text</MenuItem>
              <MenuItem value="number">Number</MenuItem>
              <MenuItem value="radio">Radio</MenuItem>
            </TextField>

            <TextField label="Label" fullWidth {...register("label")} />

            <TextField
              label="Type to Label Orientation"
              fullWidth
              {...register("typeToLabelOrientation")}
            />

            {selectedType === "text" && (
              <TextField
                label="Placeholder"
                fullWidth
                {...register("placeHolder")}
              />
            )}

            <TextField
              label="HelpText"
              multiline
              rows={3}
              fullWidth
              {...register("helpText")}
            />

            {selectedType === "radio" && (
              <Box>
                <Typography sx={{ mt: 2, mb: 1, fontWeight: "bold" }}>
                  Options
                </Typography>
                {fields.map((field, index) => (
                  <Box
                    key={field.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <TextField
                      label={`Option ${index + 1}`}
                      fullWidth
                      {...register(`options.${index}.value` as const)}
                    />
                    <IconButton
                      onClick={() => remove(index)}
                      color="error"
                      disabled={fields.length === 1} 
                    >
                      <RemoveCircleOutlineIcon />
                    </IconButton>
                  </Box>
                ))}
                <Button
                  variant="contained"
                  size="small"
                  color="success"
                  startIcon={<AddIcon />}
                  onClick={() => append({ value: "" })}
                  sx={{ mt: 1, mr: 1 }}
                >
                  Add Option
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  color="error"
                  onClick={() => replace([{ value: "" }])}
                  sx={{ mt: 1 }}
                >
                  Reset Options
                </Button>
              </Box>
            )}
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disableElevation>
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default FormListingPage;

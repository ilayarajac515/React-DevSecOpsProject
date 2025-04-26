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
import { GridColDef } from "@mui/x-data-grid";
import LongMenu from "../components/LogMenu"; 

const columns: GridColDef[] = [
  { field: "formName", headerName: "Form Name", width: 250 },
  { field: "type", headerName: "Type", width: 250 },
  { field: "status", headerName: "Status", width: 250 },
  { field: "submissions", headerName: "Submissions", width: 250 },
  { field: "manager", headerName: "Manager", width: 250 },
  {
    field: "actions",
    headerName: "",
    width: 200,
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
    align: "center",
    renderCell: () => <LongMenu />,
  },
];

const rows = [
  { id: 1, formName: "Leave Request", type: "HR", status: "Active", submissions: 23, manager: "Jon Snow" },
  { id: 2, formName: "IT Support", type: "IT", status: "Inactive", submissions: 12, manager: "Cersei Lannister" },
  { id: 3, formName: "Travel Request", type: "Admin", status: "Active", submissions: 5, manager: "Jaime Lannister" },
  { id: 4, formName: "Asset Request", type: "IT", status: "Active", submissions: 7, manager: "Arya Stark" },
  { id: 5, formName: "Feedback", type: "HR", status: "Inactive", submissions: 16, manager: "Daenerys Targaryen" },
  { id: 6, formName: "Reimbursement", type: "Finance", status: "Active", submissions: 3, manager: "Markandeyan" },
  { id: 7, formName: "Security Access", type: "Admin", status: "Active", submissions: 11, manager: "Ferrara Clifford" },
  { id: 8, formName: "Exit Interview", type: "HR", status: "Inactive", submissions: 4, manager: "Rossini Frances" },
  { id: 9, formName: "Performance Review", type: "HR", status: "Active", submissions: 6, manager: "Roxie Harvey" },
  { id: 10, formName: "Leave Approval", type: "HR", status: "Active", submissions: 14, manager: "Thiru Murugan" },
];

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
          Create Form
        </Button>
      </Box>

      <Box sx={{ marginTop: "30px" }}>
      <DataTable columns={columns} rows={rows} />
      </Box>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{fontWeight: "bold" }}>
          Create Form
        </DialogTitle>

        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <TextField
              select
              label="Type"
              fullWidth
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

            { selectedType === "radio" && (
              <Box>
                <Typography sx={{ mt: 2, mb: 1, fontWeight: "bold" }}>
                  Options
                </Typography>
                { fields.map((field, index) => (
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

          <DialogActions sx={{padding:"30px"}}>
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

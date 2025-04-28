import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for routing
import DataTable from "../components/DataTable";
import { GridColDef } from "@mui/x-data-grid";
import LongMenu from "../components/LogMenu";
import { useAuth } from "../context/GlobalContext";
import { useAddFormMutation, useGetFormsQuery } from "../modules/form_slice";
import { v4 as uuid } from 'uuid';
 
const columns: GridColDef[] = [
  { field: "label", headerName: "Form Name", width: 250 },
  { field: "description", headerName: "Description", width: 250 },
  { field: "submissions", headerName: "Submissions", width: 250 },
  { field: "duration", headerName: "Duration", width: 250 },
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
 
type FormValues = {
  label: string;
  description: string;
  startContent: string;
  endContent: string;
  duration: string;
  manager: string;
};
 
const FormListingPage = () => {
  const { data, isLoading } = useGetFormsQuery();
  const [addForm] = useAddFormMutation();
  const [open, setOpen] = useState(false);
  const [formRows, setFormRows] = useState<any[]>([]);
  const { name } = useAuth();
  const navigate = useNavigate(); // Initialize useNavigate hook
 
  const { register, handleSubmit, reset } = useForm<FormValues>();
 
  // Set formRows with fetched data
  useEffect(() => {
    if (data) {
      const rowsWithIds = data.map((form: any) => ({
        ...form,
        id: form.formId ?? uuid(), // Ensure each form has a unique id
      }));
      setFormRows(rowsWithIds);
    }
  }, [data]);
 
  const onSubmit = (data: FormValues) => {
    const newForm = {
      id: uuid(),
      formId: uuid(),
      label: data.label,
      description: data.description,
      startContent: data.startContent,
      endContent: data.endContent,
      duration: data.duration,
      manager: name ?? '',
    };
    addForm(newForm);
    setFormRows((prev) => [...prev, newForm]);
    setOpen(false);
    reset();
  };
 
  const handleRowClick = (formId: string) => {
    navigate(`/field-listing-page/${formId}`);
  };
 
  return (
    <Box sx={{ display: "flex", flexDirection: "column", marginTop: "30px" }}>
      {/* Header */}
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
        {isLoading ? (
          <Typography>Loading...</Typography>
        ) : (
          <DataTable
            columns={columns}
            rows={formRows}
            onRowClick={(params: any) => handleRowClick(params.row.formId)}  // Handle row click to navigate
          />
        )}
      </Box>
 
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>Create Form</DialogTitle>
 
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <TextField label="Form Name" {...register("label", { required: true })} fullWidth />
            <TextField
              label="Description"
              {...register("description", { required: true })}
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              label="Start Content"
              {...register("startContent", { required: true })}
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              label="End Content"
              {...register("endContent", { required: true })}
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              label="Duration"
              {...register("duration", { required: true })}
              placeholder="In Minutes"
              required
              fullWidth
            />
          </DialogContent>
 
          <DialogActions sx={{ padding: "30px" }}>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disableElevation>
              Create Form
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};
 
export default FormListingPage;
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
import { useNavigate } from "react-router-dom";
import DataTable from "../components/DataTable";
import { GridColDef } from "@mui/x-data-grid";
import LongMenu from "../components/LogMenu";
import { useAuth } from "../context/GlobalContext";
import {
  useAddFormMutation,
  useUpdateFormMutation,
  useDeleteFormMutation,
  useGetFormsQuery,
} from "../modules/form_slice";
import { v4 as uuid } from "uuid";

type FormValues = {
  label: string;
  description: string;
  startContent: string;
  endContent: string;
  duration: string;
  manager: string;
};

const FormListingPage = () => {
  const [updateForm] = useUpdateFormMutation();
  const [deleteForm] = useDeleteFormMutation();
  const { data, isLoading } = useGetFormsQuery();
  const [editId, setEditId] = useState<string | null>(null);
  const [addForm] = useAddFormMutation();
  const [open, setOpen] = useState(false);
  const [formRows, setFormRows] = useState<any[]>([]);
  const { name } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, reset } = useForm<FormValues>();

  useEffect(() => {
    if (data) {
      setFormRows(data);
    }
  }, [data]);

  const Logoptions: string[] = ["edit", "delete"];
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
      renderCell: (params) => (
        <Box
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <LongMenu
            handleDelete={() => handleDelete(params.row)}
            handleEdit={() => handleEdit(params.row)}
            Logoptions={Logoptions}
          />
        </Box>
      ),
    },
  ];

  const handleDelete = async (row: any) => {
    try {
      await deleteForm(row.formId).unwrap();
    } catch (err) {
      console.error("Failed to delete form:", err);
    }
  };

  const handleEdit = (row: any) => {
    setEditId(row.formId);
    reset({
      label: row.label,
      description: row.description,
      startContent: row.startContent,
      endContent: row.endContent,
      duration: row.duration,
      manager: row.manager,
    });
    setOpen(true);
  };

  const onSubmit = async (formData: FormValues) => {
    if (editId) {
      const updatedForm = {
        formId: editId,
        ...formData,
      };
      try {
        await updateForm({ data: updatedForm }).unwrap();
        setEditId(null);
      } catch (err) {
        console.error("Failed to update form:", err);
      }
    } else {
      const newForm = {
        formId: uuid(),
        label: formData.label,
        description: formData.description,
        startContent: formData.startContent,
        endContent: formData.endContent,
        duration: formData.duration,
        manager: name ?? "",
      };
      try {
        await addForm(newForm).unwrap();
      } catch (err) {
        console.error("Failed to add form:", err);
      }
    }
    setOpen(false);
    reset();
  };

  const handleRowClick = (row: any) => {
    navigate(`/field-listing-page/${row.label}/${row.formId}`);
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
        {isLoading ? (
          <Typography>Loading...</Typography>
        ) : (
          <DataTable
            columns={columns}
            rows={formRows}
            onRowClick={(params: any) => handleRowClick(params.row)} // Handle row click to navigate
          />
        )}
      </Box>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>
          {editId ? "Edit Form" : "Create Form"}
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
              label="Form Name"
              {...register("label", { required: true })}
              fullWidth
            />
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

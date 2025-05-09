import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  Tooltip,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../components/DataTable";
import { GridColDef } from "@mui/x-data-grid";
import LongMenu from "../components/LogMenu";
import { useAuth } from "../context/GlobalContext";
import {
  useRegisterAddFormMutation,
  useRegisterUpdateFormMutation,
  useRegisterDeleteFormMutation,
  RegistrationForm,
  useGetAllRegistrationFormsQuery,
} from "../modules/admin_slice";
import { v4 as uuid } from "uuid";
import DeleteFormDialog from "../components/DeleteFormDialog";
import { toast } from "react-toastify";
import { getFormCount } from "../Services/adminService";

type FormValues = {
  branch: string;
  label: string;
  description: string;
  manager: string;
  status: string;
};

const CandidateRegistrationForm = () => {
  const [addForm] = useRegisterAddFormMutation();;
  const [updateForm] = useRegisterUpdateFormMutation();
  const [deleteForm] = useRegisterDeleteFormMutation();
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [formRows, setFormRows] = useState<RegistrationForm[]>([]);
  const { name } = useAuth();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const { register, handleSubmit, reset } = useForm<FormValues>();
  const { data: registrationData } = useGetAllRegistrationFormsQuery();

  useEffect(() => {
    const fetchFormCounts = async () => {
      if (!registrationData) return;
  
      const updatedForms = await Promise.all(
        registrationData.map(async (form) => {
          try {
            const { count } = await getFormCount(form.formId);
            console.log(count);
            
            return { ...form, submissions: count };
          } catch (err) {
            console.error(`Failed to fetch count for form ${form.formId}`, err);
            return { ...form, submissions: 0 };
          }
        })
      );
  
      setFormRows(updatedForms);
    };
  
    fetchFormCounts();
  }, [registrationData]);
  

  const Logoptions: string[] = [
    "Edit",
    "Delete",
    "Copy test url",
    "View submissions",
  ];
  const columns: GridColDef[] = [
    { field: "label", headerName: "Form Name", width: 250 },
    { field: "description", headerName: "Description", width: 250 },
    { field: "submissions", headerName: "Submissions", width: 200 },
    { field: "branch", headerName: "Branch", width: 200 },
    { field: "manager", headerName: "Manager", width: 250 },
    {
      field: "status",
      headerName: "Status",
      width: 100,
      renderCell: (params) => (
        <Tooltip title="Active / Inactive">
          <Box onClick={(event) => event.stopPropagation()}>
            <Switch
              color="success"
              checked={params.row.status === "active"}
              onChange={() => handleToggleStatus(params.row)}
            />
          </Box>
        </Tooltip>
      ),
    },
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
            handleDelete={() => handleDeleteClick(params.row)}
            handleEdit={() => handleEdit(params.row)}
            handleCopyUrl={() => handleCopyUrl(params.row)}
            handleViewSubmissions={() => handleViewSubmissions(params.row)}
            Logoptions={Logoptions}
          />
        </Box>
      ),
    },
  ];

  const handleDeleteClick = (row: any) => {
    setSelectedForm(row);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async (row: any) => {
    try {
      await deleteForm(row.formId).unwrap();
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error("Failed to delete form:", err);
    }
  };
  const handleViewSubmissions = async (row: any) => {
    navigate(`/registered-candidates-list/${row.label}/${row.formId}`);
  };

  const handleToggleStatus = async (row: any) => {
    const updatedRow = {
      ...row,
      status: row.status === "active" ? "inactive" : "active",
    };
    try {
      await updateForm({ data: updatedRow }).unwrap();
      setFormRows((prevRows) =>
        prevRows.map((form) => (form.formId === row.formId ? updatedRow : form))
      );
    } catch (err) {
      console.error("Failed to update form status:", err);
      toast.error("Status update failed");
    }
  };

  const handleEdit = (row: any) => {
    setEditId(row.formId);
    reset({
      label: row.label,
      description: row.description,
      manager: row.manager,
      branch: row.branch,
    });
    setOpen(true);
  };

  const onSubmit = async (formData: FormValues) => {
    if (editId) {
      const currentForm = formRows.find((form) => form.formId === editId);
      const updatedForm = {
        formId: editId,
        ...formData,
        status: currentForm?.status || "inactive",
      };
      try {
        await updateForm({ data: updatedForm }).unwrap();
        setEditId(null);
      } catch (err) {
        console.error("Failed to update form:", err);
      }
    } else {
      const newForm: RegistrationForm = {
        formId: uuid(),
        label: formData.label,
        description: formData.description,
        branch: formData.branch,
        manager: name ?? "",
        status: "inactive",
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

  const handleCopyUrl = (row: any) => {
    const url = `http://localhost:5173/candidate-registration-page/${row.formId}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied successfully!");
  };

  const handleRowClick = (row: any) => {
    navigate(`/registered-candidates-list/${row.label}/${row.formId}`);
  };

  const handleCreate = () => {
    reset({
      label: "",
      description: "",
      branch:"",
      status:"",
      manager: "",
    });
    setEditId(null);
    setOpen(true);
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
        <Typography sx={{ fontWeight: "bold" }}>Registration Manager</Typography>
        <Button
          variant="contained"
          disableElevation
          onClick={() => handleCreate()}
        >
          Create Form
        </Button>
      </Box>

      <Box sx={{ marginTop: "30px" }}>
          <DataTable
            columns={columns}
            rows={formRows}
            onRowClick={(params: any) => handleRowClick(params.row)}
          />
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
              label="Branch"
              {...register("branch", { required: true })}
              fullWidth
            />
          </DialogContent>

          <DialogActions sx={{ padding: "30px" }}>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disableElevation>
              {editId ? "Edit Form" : "Create Form"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <DeleteFormDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedForm(null);
        }}
        selectedForm={selectedForm}
        onDelete={() => handleDelete(selectedForm)}
      />
    </Box>
  );
};

export default CandidateRegistrationForm;

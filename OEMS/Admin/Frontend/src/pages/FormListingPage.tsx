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
  Divider,
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
  useLazyGetFieldsByFormIdQuery,
  useCloneFormMutation,
  useGetArchivedFormsQuery,
  useUnarchiveFormMutation,
} from "../modules/admin_slice";
import { v4 as uuid } from "uuid";
import { toast } from "react-toastify";
import { useLazyGetSubmittedCountQuery } from "../modules/admin_slice";
import ConfirmationDialog from "../components/ConfirmationDialog";
import PreviewForm from "../components/PreviewForm";
import CloseIcon from "@mui/icons-material/Close";
import ArchiveIcon from "@mui/icons-material/Archive";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useLazyGetFormByIdQuery } from "../modules/candidate_slice";

type FormValues = {
  label: string;
  description: string;
  startContent: string;
  branch: string;
  duration: string;
  manager: string;
};

const FormListingPage = () => {
  const [updateForm] = useUpdateFormMutation();
  const [deleteForm] = useDeleteFormMutation();
  const [unArchive] = useUnarchiveFormMutation();
  const { data, isLoading } = useGetFormsQuery();
  const { data: archievedForms } = useGetArchivedFormsQuery();
  const [editId, setEditId] = useState<string | null>(null);
  const [addForm] = useAddFormMutation();
  const [open, setOpen] = useState(false);
  const [formRows, setFormRows] = useState<any[]>([]);
  const [archievedFormRow, setArchievedForRows] = useState<any[]>([]);
  const [isArchieved, setIsArchieved] = useState<boolean>();
  const { name } = useAuth();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const { register, handleSubmit, reset } = useForm<FormValues>();
  const [triggerGetSubmittedCount] = useLazyGetSubmittedCountQuery();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewForm, setPreviewForm] = useState<any>(null);

  useEffect(() => {
    if (data) {
      const fetchSubmissionCounts = async () => {
        const rowsWithCounts = await Promise.all(
          data.map(async (form) => {
            try {
              const response = await triggerGetSubmittedCount(
                form.formId
              ).unwrap();
              return {
                ...form,
                submissions: response.submittedCount ?? 0,
              };
            } catch (err: any) {
              console.log(err);
              return {
                ...form,
                submissions: 0,
              };
            }
          })
        );
        setFormRows(rowsWithCounts);
      };

      fetchSubmissionCounts();
    }
  }, [data, triggerGetSubmittedCount]);

  useEffect(() => {
    if (archievedForms) {
      setArchievedForRows(archievedForms);
    }
  }, [archievedForms]);

  const Logoptions: string[] = isArchieved
    ? [
        "Edit",
        "UnArchive",
        "Form builder",
        "Copy test url",
        "View submissions",
        "Eligible examinees",
        "Preview Form",
        "Clone Form",
      ]
    : [
        "Edit",
        "Archive",
        "Form builder",
        "Copy test url",
        "View submissions",
        "Eligible examinees",
        "Preview Form",
        "Clone Form",
      ];

  const columns: GridColDef[] = [
    { field: "label", headerName: "Form Name", width: 250 },
    { field: "description", headerName: "Description", width: 250 },
    { field: "branch", headerName: "Branch", width: 150 },
    { field: "duration", headerName: "Duration (In mins)", width: 150 },
    { field: "submissions", headerName: "Submissions", width: 120 },
    { field: "manager", headerName: "Manager", width: 200 },
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
            handleArchive={() => handleDeleteClick(params.row)}
            handleUnArchive={() => handleUnArchive(params.row)}
            handleEdit={() => handleEdit(params.row)}
            handleCopyUrl={() => handleCopyUrl(params.row)}
            handleForm={() => handleForm(params.row)}
            handleViewSubmissions={() => handleViewSubmissions(params.row)}
            handlePreviewForm={() => handlePreviewForm(params.row)}
            handleViewEligibleExaminees={() =>
              handleViewEligibleExaminees(params.row)
            }
            handleCloneForm={() => handleCloneForm(params.row)}
            Logoptions={Logoptions}
          />
        </Box>
      ),
    },
  ];

  const [triggerField, { data: fieldsData }] = useLazyGetFieldsByFormIdQuery();
  const [triggerForm, { data: formData }] = useLazyGetFormByIdQuery();
  const [cloneForm] = useCloneFormMutation();

  const handleCloneForm = (row: any) => {
    const formId = row.formId || "";
    triggerField(formId);
    triggerForm(formId);
  };

  useEffect(() => {
    if (fieldsData && formData) {
      cloneForm({
        form: { ...formData, manager: name ?? formData.manager },
        fields: fieldsData,
      });
    }
  }, [fieldsData, formData]);

  const handleViewEligibleExaminees = (row: any) => {
    navigate(`/eligible-examinees/${row.label}/${row.formId}`);
  };

  const handlePreviewForm = (row: any) => {
    setPreviewForm(row);
    setPreviewOpen(true);
  };

  const handleDeleteClick = (row: any) => {
    setSelectedForm(row);
    setDeleteDialogOpen(true);
  };

  const handleArchive = async (row: any) => {
    try {
      await deleteForm(row.formId).unwrap();
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error("Failed to delete form:", err);
    }
  };
  const handleUnArchive = async (row: any) => {
    try {
      await unArchive(row.formId).unwrap();
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error("Failed to delete form:", err);
    }
  };
  const handleViewSubmissions = async (row: any) => {
    navigate(`/submissions-page/${row.label}/${row.formId} `);
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
      startContent: row.startContent,
      branch: row.branch,
      duration: row.duration,
      manager: row.manager,
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
      const newForm = {
        formId: uuid(),
        label: formData.label,
        description: formData.description,
        startContent: formData.startContent,
        branch: formData.branch,
        duration: formData.duration,
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
  const handleForm = (row: any) => {
    navigate(`/field-listing-page/${row.label}/${row.formId}`);
  };

  const handleCopyUrl = (row: any) => {
    const url = `${import.meta.env.VITE_CANDIDATE_TEST}/${row.formId}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied!");
  };

  const handleRowClick = (row: any) => {
    navigate(`/field-listing-page/${row.label}/${row.formId}`);
  };

  const handleCreate = () => {
    reset({
      label: "",
      description: "",
      startContent: "",
      branch: "",
      duration: "",
      manager: "",
    });
    setEditId(null);
    reset();
    setOpen(true);
  };
  if (isLoading) {
    return null;
  }

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
        <Typography sx={{ fontWeight: "bold" }}>
          {isArchieved ? "Archived Assessments" : "Assessment Manager"}
        </Typography>
        <Box sx={{ display: "flex", gap: "10px" }}>
          <Tooltip title="Archieved forms">
            <Button
              variant="contained"
              color={isArchieved ? "warning" : "success"}
              onClick={() => setIsArchieved(!isArchieved)}
              startIcon={isArchieved ? <ArrowBackIcon /> : <ArchiveIcon />}
            >
              {isArchieved ? "Back" : "Archived"}
            </Button>
          </Tooltip>
          <Tooltip title="New Form">
            <Button
              variant="contained"
              disableElevation
              onClick={() => handleCreate()}
            >
              Create
            </Button>
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ marginTop: "30px" }}>
        <DataTable
          columns={columns}
          rows={isArchieved ? archievedFormRow : formRows}
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
          {editId ? "Edit Assessment" : "Create Assessment"}
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
              rows={10}
            />
            <TextField
              label="Branch"
              {...register("branch", { required: true })}
              fullWidth
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
              {editId ? "Save" : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <DialogTitle sx={{ fontWeight: "bold" }}>
            Preview Form - {previewForm?.label}
          </DialogTitle>
          <DialogTitle sx={{ fontWeight: "bold" }}>
            <Tooltip title="Close">
              <Button
                color="error"
                variant="outlined"
                onClick={() => setPreviewOpen(false)}
              >
                <CloseIcon />
              </Button>
            </Tooltip>
          </DialogTitle>
        </Box>
        <Divider />
        <DialogActions>
          <PreviewForm form={previewForm} />
        </DialogActions>
      </Dialog>

      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedForm(null);
        }}
        onDelete={() => handleArchive(selectedForm)}
        itemLabel={selectedForm?.label}
        confirmLabel="Archive"
        title="Archive Form"
        description={
          <>
            Are you sure you want to Archive the form{" "}
            <strong>{selectedForm?.label}</strong> ?
          </>
        }
      />
    </Box>
  );
};

export default FormListingPage;

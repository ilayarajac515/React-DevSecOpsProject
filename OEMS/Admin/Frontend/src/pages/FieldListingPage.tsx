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
  Divider,
  Tooltip,
} from "@mui/material";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useState, useEffect } from "react";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { DataGridPro, GridColDef, GridRowsProp } from "@mui/x-data-grid-pro";
import { GridRowOrderChangeParams } from "@mui/x-data-grid-pro";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import CloseIcon from "@mui/icons-material/Close";
import LongMenu from "../components/LogMenu";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { CustomUploadAdapter } from "../utils/ckeditorUploadAdapter";
import type { Field } from "../modules/admin_slice";
import {
  useAddFieldMutation,
  useDeleteFieldMutation,
  useEditFieldMutation,
  useGetFieldsByFormIdQuery,
  useReplaceFieldsMutation,
  useUploadImageMutation,
} from "../modules/admin_slice";
import { v4 as uuid } from "uuid";
import { useParams } from "react-router-dom";
import PreviewForm from "../components/PreviewForm";

type Option = {
  value: string;
};
type Question = {
  question: string;
};

type FormValues = {
  type: string;
  label: string;
  placeholder: string;
  textArea: string;
  options: Option[];
  questions: Question[];
  rta: any;
};

const FieldListingPage = () => {
  const Logoptions: string[] = ["Edit", "Delete"];
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [targettedIndex, setTargettedIndex] = useState<number | null>();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewForm, setPreviewForm] = useState<any>(null);
  const [uploadImageMutation] = useUploadImageMutation();

  const { register, handleSubmit, reset, watch, control } = useForm<FormValues>({
    defaultValues: {
      type: "",
      label: "",
      placeholder: "Enter Your Text Here",
      textArea: "",
      options: [{ value: "" }],
      questions: [{ question: "" }],
      rta: "",
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "options" });
  const {
    fields: rtaFields,
    append: appendRta,
    remove: removeRta,
    replace: replaceRta,
  } = useFieldArray({ control, name: "questions" });

  const selectedType = watch("type");
  const { formId, form } = useParams();
  const [addField] = useAddFieldMutation();
  const [deleteField] = useDeleteFieldMutation();
  const [editField] = useEditFieldMutation();
  const [swapField] = useReplaceFieldsMutation();
  const { data } = useGetFieldsByFormIdQuery(formId ?? "");

  useEffect(() => {
    if (data) {
      setRows(data);
    }
  }, [data]);

  useEffect(() => {
    if (rows && rows.length > 0) {
      const mutableFields: Field[] = rows.map(({ formId, ...rest }) => ({
        ...rest,
      })) as Field[];
      swapField({ formId: formId ?? "", fields: mutableFields });
    }
  }, [targettedIndex]);

  const handleCreate = () => {
    reset({
      type: "",
      label: "",
      placeholder: "Enter Your Text Here",
      textArea: "",
      options: [{ value: "" }],
      questions: [{ question: "" }],
      rta: "",
    });
    setEditId(null);
    setOpen(true);
  };

  const handleDelete = (row: any) => {
    deleteField({ formId: formId!, fieldId: row.fieldId! });
    setEditId(null);
  };

  const handleEdit = (row: any) => {
    setEditId(row.fieldId);
    setOpen(true);
    reset({
      type: row?.type,
      label: row?.label,
      placeholder: row?.placeholder || "Enter Your Text Here",
      textArea: row?.type === "textArea" ? row?.textArea?.content || "" : "",
      options:
        row?.type === "radio"
          ? row?.options?.map((value: string) => ({ value })) || [{ value: "" }]
          : [{ value: "" }],
      rta: row?.type === "rta" ? row?.rta?.content : "",
      questions:
        row?.type === "rta"
          ? row?.rta?.questions?.map((q: string) => ({ question: q }))
          : [{ question: "" }],
    });
  };

  const handlePreviewForm = () => {
    setPreviewOpen(true);
    setPreviewForm(formId);
  };

  const onSubmit = async (data: FormValues) => {
    const newField = {
      id: uuid(),
      fieldId: editId ?? uuid(),
      formId: formId,
      label: data.label || "—",
      placeholder: data.placeholder || "Enter Your Text Here",
      type: data.type,
      options:
        data.type === "radio"
          ? data.options.map((opt) => opt.value.trim()).filter(Boolean)
          : data.type === "text" || data.type === "textArea"
            ? "-"
            : "Not Provided",
      rta:
        data.type === "rta"
          ? {
              content: data.rta,
              questions: data.questions.map((q) => q.question.trim()).filter(Boolean),
            }
          : null,
      textArea: data.type === "textArea" ? {content: data.textArea}: null,
    };

    try {
      if (editId) {
        await editField({ formId: formId ?? "", data: newField });
        setRows((prevRows) =>
          prevRows.map((row) => (row.fieldId === editId ? newField : row))
        );
      } else {
        await addField({ formId: formId ?? "", data: newField }).unwrap();
        setRows((prevRows) => [...prevRows, newField]);
      }
      setOpen(false);
      reset();
      setEditId(null);
    } catch (err) {
      console.error("Error submitting field:", err);
    }
  };

  const columns: GridColDef[] = [
    { field: "label", headerName: "Label", width: 1100 },
    { field: "type", headerName: "Field Type", width: 150 },
    {
      field: "actions",
      headerName: "",
      width: 150,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      align: "center",
      renderCell: (params) => (
        <LongMenu
          handleEdit={() => handleEdit(params.row)}
          handleDelete={() => handleDelete(params.row)}
          Logoptions={Logoptions}
        />
      ),
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", marginTop: "30px" }}>
      {/* Top Bar */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          background: "white",
          border: "1px solid lightGray",
          padding: "20px",
          alignItems: "center",
          borderRadius: "10px",
        }}
      >
        <Typography sx={{ fontWeight: "bold", marginBottom: { xs: "10px", xl: "0px" } }}>
          {form}
        </Typography>
        <Box sx={{ display: "flex", gap: 3 }}>
          <Button startIcon={<VisibilityIcon />} variant="text" onClick={handlePreviewForm}>
            Preview Form
          </Button>
          <Button variant="contained" onClick={handleCreate}>
            Create Field
          </Button>
        </Box>
      </Box>

      {/* DataGrid */}
      <Box sx={{ marginTop: "30px", height: "630px" }}>
        <DataGridPro
          columns={columns}
          rows={rows}
          slots={{ rowReorderIcon: () => <SwapVertIcon /> }}
          rowReordering
          onRowOrderChange={(params: GridRowOrderChangeParams) => {
            const draggedRow = params.row;
            const targetIndex = params.targetIndex;
            setTargettedIndex(targetIndex);
            const currentIndex = rows.findIndex((r) => r.id === draggedRow.id);
            if (currentIndex === -1 || targetIndex === -1) return;
            const updatedRows = [...rows];
            updatedRows.splice(currentIndex, 1);
            updatedRows.splice(targetIndex, 0, draggedRow);
            setRows(updatedRows);
          }}
          disableRowSelectionOnClick
        />
      </Box>

      {/* Dialog Form */}
      <Dialog open={open} onClose={() => { setOpen(false); reset(); setEditId(null); }} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: "bold" }}>{editId ? "Edit Field" : "Create Field"}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Controller
              name="type"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField {...field} disabled={!!editId} select label="Type" fullWidth>
                  <MenuItem value="text">Text</MenuItem>
                  <MenuItem value="textArea">Text Area</MenuItem>
                  <MenuItem value="radio">Radio</MenuItem>
                  <MenuItem value="rta">Rich Text Area</MenuItem>
                </TextField>
              )}
            />

            <TextField label="Label" fullWidth {...register("label", { required: true })} />

            {selectedType === "text" && (
              <TextField label="Placeholder" fullWidth {...register("placeholder")} />
            )}

            {selectedType === "textArea" && (
              <Box>
                <Typography sx={{ fontWeight: "bold", mb: 1 }}>Text Area</Typography>
                <Controller
                  control={control}
                  name="textArea"
                  defaultValue=""
                  render={({ field: { onChange, value } }) => (
                    <CKEditor
                      editor={ClassicEditor as any}
                      data={value}
                      onReady={(editor: any) => {
                        editor.plugins.get("FileRepository").createUploadAdapter = (loader: any) =>
                          new CustomUploadAdapter(loader, async (formData: FormData) => {
                            const result = await uploadImageMutation(formData).unwrap();
                            return { imageUrl: result.imageUrl };
                          });
                      }}
                      onChange={(_, editor) => onChange(editor.getData())}
                    />
                  )}
                />
              </Box>
            )}

            {/* Rich Text Area Section */}
            {selectedType === "rta" && (
              <Box>
                <Controller
                  control={control}
                  name="rta"
                  defaultValue=""
                  render={({ field: { onChange, value } }) => (
                    <CKEditor
                      editor={ClassicEditor as any}
                      data={value}
                      onReady={(editor: any) => {
                        editor.plugins.get("FileRepository").createUploadAdapter = (loader: any) =>
                          new CustomUploadAdapter(loader, async (formData: FormData) => {
                            const result = await uploadImageMutation(formData).unwrap();
                            return { imageUrl: result.imageUrl };
                          });
                      }}
                      onChange={(_, editor) => onChange(editor.getData())}
                    />
                  )}
                />
                <Typography sx={{ mt: 2, mb: 1, fontWeight: "bold" }}>Questions</Typography>
                {rtaFields.map((field, index) => (
                  <Box key={field.id} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <TextField
                      label={`Question ${index + 1}`}
                      fullWidth
                      {...register(`questions.${index}.question` as const)}
                    />
                    <IconButton onClick={() => removeRta(index)} color="error" disabled={rtaFields.length === 1}>
                      <RemoveCircleOutlineIcon />
                    </IconButton>
                  </Box>
                ))}
                <Button variant="contained" size="small" color="success" startIcon={<AddIcon />} onClick={() => appendRta({ question: "" })} sx={{ mt: 1, mr: 1 }}>
                  Add Question
                </Button>
                <Button variant="contained" size="small" color="error" onClick={() => replaceRta([{ question: "" }])} sx={{ mt: 1 }}>
                  Reset Questions
                </Button>
              </Box>
            )}

            {/* Radio Options */}
            {selectedType === "radio" && (
              <Box>
                <Typography sx={{ mt: 2, mb: 1, fontWeight: "bold" }}>Options</Typography>
                {fields.map((field, index) => (
                  <Box key={field.id} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <TextField
                      label={`Option ${index + 1}`}
                      fullWidth
                      {...register(`options.${index}.value` as const, { required: true })}
                    />
                    <IconButton onClick={() => remove(index)} color="error" disabled={fields.length === 1}>
                      <RemoveCircleOutlineIcon />
                    </IconButton>
                  </Box>
                ))}
                <Button variant="contained" size="small" color="success" startIcon={<AddIcon />} onClick={() => append({ value: "" })} sx={{ mt: 1, mr: 1 }}>
                  Add Option
                </Button>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ padding: "20px" }}>
            <Button onClick={() => { setOpen(false); reset(); setEditId(null); }} color="error" variant="outlined">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {editId ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <DialogTitle sx={{ fontWeight: "bold" }}>Preview Form - {form}</DialogTitle>
          <DialogTitle>
            <Tooltip title="Close">
              <Button color="error" variant="outlined" onClick={() => setPreviewOpen(false)}>
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
    </Box>
  );
};

export default FieldListingPage;

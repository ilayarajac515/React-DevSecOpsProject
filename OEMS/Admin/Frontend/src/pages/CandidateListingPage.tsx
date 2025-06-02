import {
  Box,
  Button,
  Paper,
  Typography,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Input,
} from "@mui/material";
import {
  DataGridPro,
  GridColDef,
  useGridApiRef,
  GridFilterModel,
} from "@mui/x-data-grid-pro";
import DownloadIcon from "@mui/icons-material/Download";
import CloseIcon from "@mui/icons-material/Close";
import UploadIcon from "@mui/icons-material/Upload";
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { toast } from "react-toastify";
import type { Candidate } from "../Services/adminService";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  useGetAllUserRemarksQuery,
  useGetCandidatesQuery,
  useInsertCandidatesMutation,
} from "../modules/admin_slice";
import * as XLSX from "xlsx";

const columns: GridColDef[] = [
  { field: "name", headerName: "Name", width: 150 },
  { field: "email", headerName: "Email", width: 250 },
  { field: "mobile", headerName: "Mobile", width: 110 },
  { field: "degree", headerName: "Degree", width: 100 },
  { field: "department", headerName: "Department", width: 150 },
  {
    field: "degree_percentage",
    headerName: "Degree %",
    type: "number",
    width: 100,
  },
  {
    field: "sslc_percentage",
    headerName: "SSLC %",
    type: "number",
    width: 100,
  },
  {
    field: "hsc_percentage",
    headerName: "HSC %",
    type: "number",
    width: 100,
  },
  { field: "location", headerName: "Location", width: 120 },
  { field: "relocate", headerName: "Relocate?", width: 100 },
  { field: "remarks", headerName: "Remarks", width: 100 },
];

export default function CandidatesListingPage() {
  const apiRef = useGridApiRef();
  const { registerFormId: formId } = useParams();
  const { data } = useGetCandidatesQuery({
    formId: formId ?? "",
    tableType: "Registration",
  });
  const [selectedCandidates] = useInsertCandidatesMutation();
  const {data: remarksHistory} = useGetAllUserRemarksQuery();
  const [rows, setRows] = useState<Candidate[]>([]);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
  });

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadedRows, setUploadedRows] = useState<Candidate[]>([]);
  const [candidateRegister] = useInsertCandidatesMutation();
  useEffect(() => {
  if (data && remarksHistory) {
    const mergedRows = data.candidates.map((candidate) => {
      const remarkEntry = remarksHistory.find(
        (remark) =>
          remark.userEmail === candidate.email
      );

      return {
        ...candidate,
        remarks: remarkEntry ? remarkEntry.remarks : "",
      };
    });

    setRows(mergedRows);
  }
}, [data, remarksHistory, formId]);

  const handleDownload = () => {
    if (!apiRef.current) return;
    const selectedIDs = apiRef?.current.getSelectedRows();
    const selectedRows = Array.from(selectedIDs.values());

    if (selectedRows.length === 0) {
      toast.error("Please select at least one row to download.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(selectedRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Candidates");
    XLSX.writeFile(workbook, "selected_candidates.xlsx");
    toast.success("Downloaded successfully!");
  };

  const handleSelectCandidates = async () => {
    const selectedIDs = apiRef?.current?.getSelectedRows();
    const selectedRows = Array.from(selectedIDs!.values());

    if (selectedRows.length === 0) {
      toast.error("Please select at least one row.");
      return;
    }

    await selectedCandidates({
      formId: formId ?? "",
      tableType: "Selected",
      candidates: selectedRows,
    });

    toast.success("Added to the selected candidates");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as Candidate[];
      setUploadedRows(jsonData);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleAddUploadedCandidates = async () => {
    await candidateRegister({
      formId: formId ?? "",
      tableType: "Registration",
      candidates: uploadedRows,
    });

    setUploadDialogOpen(false);
    setUploadedRows([]);
    toast.success("Candidates added from uploaded file.");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", marginTop: "30px" }}>
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
        <Typography
          sx={{ fontWeight: "bold", marginBottom: { xs: "10px", xl: "0px" } }}
        >
          Registered Candidates
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Tooltip title="Upload Candidates">
            <Button
              disableElevation
              variant="contained"
              color="success"
              startIcon={<UploadFileRoundedIcon />}
              onClick={() => setUploadDialogOpen(true)}
            >
              Upload
            </Button>
          </Tooltip>
          <Tooltip title="Download Selected">
            <Button
              disableElevation
              variant="contained"
              color="primary"
              onClick={handleDownload}
              startIcon={<DownloadIcon />}
            >
              Download
            </Button>
          </Tooltip>
          <Tooltip title="Select Candidates">
            <Button
              disableElevation
              variant="contained"
              color="primary"
              startIcon={<GroupAddIcon />}
              onClick={handleSelectCandidates}
            >
              Eligible Candidates
            </Button>
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ marginTop: "30px" }}>
        <Paper elevation={0} sx={{ borderRadius: 3 }}>
          <DataGridPro
            apiRef={apiRef}
            rows={rows}
            columns={columns}
            checkboxSelection
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[10, 25, 50, 100]}
            filterModel={filterModel}
            onFilterModelChange={setFilterModel}
            sx={{
              border: "1px solid lightgray",
              height: 631,
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f5f5f5",
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: "bold",
                fontSize: 14,
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "#f0f7ff",
              },
            }}
          />
        </Paper>
      </Box>

      <Dialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
      >
        <DialogTitle>
          Upload Candidates
          <IconButton
            aria-label="close"
            onClick={() => setUploadDialogOpen(false)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Typography variant="body2" gutterBottom>
            Upload an Excel (.xlsx) file containing candidate data.
          </Typography>

          <Box
            sx={{
              marginTop: 2,
              padding: 4,
              border: "2px dashed #ccc",
              borderRadius: "10px",
              textAlign: "center",
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "#f9f9f9",
              },
            }}
            onClick={() => document.getElementById("fileInput")?.click()}
          >
            <UploadIcon sx={{ fontSize: 40, color: "#888" }} />
            <Typography variant="body2" sx={{ marginTop: 1 }}>
              Click to upload .xlsx file
            </Typography>
            <Input
              id="fileInput"
              type="file"
              inputProps={{ accept: ".xlsx" }}
              sx={{ display: "none" }}
              onChange={handleFileUpload}
            />
            {uploadedRows.length > 0 && (
              <Typography
                variant="caption"
                sx={{ marginTop: 1, display: "block", color: "green" }}
              >
                {uploadedRows.length} candidates loaded from file.
              </Typography>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddUploadedCandidates}
            disabled={uploadedRows.length === 0}
            variant="contained"
            color="primary"
          >
            Add Candidates
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

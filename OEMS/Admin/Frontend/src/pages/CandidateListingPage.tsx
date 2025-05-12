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
  InputAdornment,
  TextField,
} from "@mui/material";
import {
  DataGridPro,
  GridColDef,
  useGridApiRef,
  GridFilterModel,
} from "@mui/x-data-grid-pro";
import DownloadIcon from "@mui/icons-material/Download";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { toast } from "react-toastify";
import { Candidate } from "../Services/adminService";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useGetCandidatesQuery, useInsertCandidatesMutation } from "../modules/admin_slice";

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
];

export default function CandidatesListingPage() {
  const apiRef = useGridApiRef();
  const { registerFormId: formId } = useParams();
  const { data } = useGetCandidatesQuery({
    formId: formId ?? "",
    tableType: "Registration",
  });
  const [selectedCandidates] = useInsertCandidatesMutation();
  const [rows, setRows] = useState<Candidate[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const registrationLink =
    "http://devopsinfoane.site/candidate-registration-page";

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });
  
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
  });

  useEffect(() => {
    if (data) {

      setRows(data.candidates);
    }
  }, [data]);

  const handleDownload = async () => {
    const selectedIDs = apiRef?.current?.getSelectedRows();
    const selectedRows = Array.from(selectedIDs!.values());
    await selectedCandidates({formId: formId ?? "", tableType : "Selected" , candidates: selectedRows})
    if (selectedRows.length === 0) {
      toast.error("Please select at least one row.");
      return;
    }
    toast.success(`Added to the selected candidates`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(registrationLink);
    toast.success("Link copied!");
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
        <Box sx={{ display: "flex", gap: 3 }}>
          <Tooltip title="Registration Link">
            <Button
              disableElevation
              variant="contained"
              color="primary"
              onClick={() => setOpenDialog(true)}
            >
              Get Apply Link
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
            onFilterModelChange={(model) => setFilterModel(model)}
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
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Registration Link</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            value={registrationLink}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleCopy}>
                    <ContentCopyIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

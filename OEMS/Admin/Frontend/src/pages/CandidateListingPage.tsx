import {
  Box,
  Button,
  Container,
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
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { Candidate, getCandidates } from "../Services/adminService";
import { useEffect, useState } from "react";

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "name", headerName: "Name", width: 150 },
  { field: "email", headerName: "Email", width: 220 },
  { field: "mobile", headerName: "Mobile", width: 110 },
  { field: "degree", headerName: "Degree", width: 110 },
  { field: "department", headerName: "Department", width: 150 },
  {
    field: "degree_percentage",
    headerName: "Degree %",
    type: "number",
    width: 120,
  },
  {
    field: "sslc_percentage",
    headerName: "SSLC %",
    type: "number",
    width: 120,
  },
  {
    field: "hsc_percentage",
    headerName: "HSC %",
    type: "number",
    width: 120,
  },
  { field: "location", headerName: "Location", width: 130 },
  { field: "relocate", headerName: "Relocate?", width: 120 },
];

export default function CandidatesListingPage() {
  const apiRef = useGridApiRef();
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
    const fetchData = async () => {
      try {
        const response = await getCandidates();
        setRows(response.employees);
      } catch (error) {
        toast.error("Failed to fetch Candidates");
      }
    };
    fetchData();
  }, []);

  const handleDownload = () => {
    const selectedIDs = apiRef?.current?.getSelectedRows();
    const selectedRows = Array.from(selectedIDs!.values());

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

  const handleCopy = () => {
    navigator.clipboard.writeText(registrationLink);
    toast.success("Link copied to clipboard!");
  };

  return (
    <Container maxWidth="xl" sx={{ mt: "30px" }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          border: "1px solid lightgray",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: { xs: "center", sm: "space-between" },
            textAlign: { xs: "center", sm: "left" },
            gap: 2,
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            color="primary"
            sx={{
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Candidates List
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              justifyContent: { xs: "center", sm: "flex-end" },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            <Tooltip title="Registration Link">
              <Button
              disableElevation
                variant="contained"
                color="primary"
                sx={{ height: 40 }}
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
                sx={{ height: 40 }}
              >
                Download
              </Button>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

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
            borderRadius: 3,
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
    </Container>
  );
}

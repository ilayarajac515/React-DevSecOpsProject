import { Box, Button, Typography } from "@mui/material";
import {
  DataGridPro,
  GridColDef,
  GridRowsProp,
  useGridApiRef,
} from "@mui/x-data-grid-pro";
import LongMenu from "../components/LogMenu";
import DownloadIcon from "@mui/icons-material/Download";
import { useGetSubmissionsByFormIdQuery } from "../modules/admin_slice";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";

const SubmissionsPage = () => {
  const apiRef = useGridApiRef();
  const Logoptions: string[] = ["View Answers"];
  const { id: formId } = useParams();
  const [rows, setRows] = useState<GridRowsProp>([]);
  const navigate = useNavigate();
  const columns: GridColDef[] = [
    { field: "userEmail", headerName: "Email", width: 350 },
    { field: "startTime", headerName: "Start Time", width: 150 },
    { field: "endTime", headerName: "End Time", width: 150 },
    { field: "duration", headerName: "Duration", width: 150 },
    { field: "status", headerName: "Status", width: 150 },
    { field: "warning", headerName: "Warnings", width: 150 },
    {
      field: "score",
      headerName: "Score",
      width: 150,
      editable: true,
    },
    {
      field: "actions",
      headerName: "",
      width: 150,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      align: "center",
      renderCell: (params) => (
        <Box onClick={(event) => event.stopPropagation()}>
          <LongMenu
            handleViewAnswers={() => handleViewAnswers(params.row)}
            Logoptions={Logoptions}
          />
        </Box>
      ),
    },
  ];

  const { data: submissionData } = useGetSubmissionsByFormIdQuery(formId ?? "");

  useEffect(() => {
    if (submissionData) {
      setRows(submissionData);
    }
  }, [submissionData]);
  console.log(submissionData);

  const handleViewAnswers = (row: any) => {
    navigate(`/examinee-answers/${row.formId}/${row.userEmail}`);
  };
  const handleDownload = () => {
    if (!apiRef.current) {
      return;
    }
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
        <Typography sx={{ fontWeight: "bold" }}>Submissions</Typography>
        <Button
          variant="contained"
          disableElevation
          disableRipple
          startIcon={<DownloadIcon />}
          onClick={() => handleDownload()}
        >
          Download
        </Button>
      </Box>

      <Box sx={{ marginTop: "30px", height: "630px" }}>
        <DataGridPro
          apiRef={apiRef}
          columns={columns}
          rows={rows}
          checkboxSelection
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
      </Box>
    </Box>
  );
};

export default SubmissionsPage;

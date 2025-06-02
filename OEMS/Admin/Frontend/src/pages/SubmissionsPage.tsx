import { Box, Button, Typography } from "@mui/material";
import {
  DataGridPro,
  GridColDef,
  GridRowsProp,
  useGridApiRef,
} from "@mui/x-data-grid-pro";
import LongMenu from "../components/LogMenu";
import DownloadIcon from "@mui/icons-material/Download";
import { useDeleteSubmissionByEmailMutation, useGetSubmissionsByFormIdQuery, useUpdateSubmissionMutation } from "../modules/admin_slice";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { useLogoutCandidateMutation } from "../modules/candidate_slice";
import { useCandidate } from "../context/CandidateContext";
 
const SubmissionsPage = () => {
  const apiRef = useGridApiRef();
  const { id: formId } = useParams();
  const [rows, setRows] = useState<GridRowsProp>([]);
    const [editSubmission] = useUpdateSubmissionMutation();
  const navigate = useNavigate();
  
  const columns: GridColDef[] = [
    { field: "userEmail", headerName: "Email", width: 300 },
    { field: "startTime", headerName: "Start Time", type: "number", width: 150 },
    { field: "endTime", headerName: "End Time", type: "number", width: 150 },
    { field: "duration", headerName: "Duration", type: "number", width: 120 },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      cellClassName: (params) =>
        params.value === "submitted"
          ? "status-submitted"
          : "status-not-submitted",
    },
    { field: "warnings", headerName: "Warnings", type: "number", width: 120 ,
      cellClassName: (params) =>
        params.value > 3 ? "status-warning" : "",
    },
    {
      field: "score",
      headerName: "Score",
      width: 120,
      type: "number",
      editable: true,
      filterable:true,
    },
    {
      field: "remarks",
      headerName: "Remarks",
      width: 150,
      editable: true,
      filterable:true,
    },
    {
      field: "actions",
      headerName: "",
      width: 150,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      align: "center",
      renderCell: (params) => {
        const row = params.row;
        const isSubmitted = row.status === "submitted";
        const filteredOptions = isSubmitted
        ? ["View Answers"]
        : ["View Answers", "Terminate"];
        return (
        <Box onClick={(event) => event.stopPropagation()}>
          <LongMenu
            handleViewAnswers={() => handleViewAnswers(params.row)}
            handleTerminate={()=> handleterminate(params.row)}
            Logoptions={filteredOptions}
          />
        </Box>
      )}
    },
  ];
 
  const { data: submissionData } = useGetSubmissionsByFormIdQuery(formId ?? "");
  const [terminateSubmission] = useDeleteSubmissionByEmailMutation();
  const [ logoutCandidate] = useLogoutCandidateMutation();
  const { setAuth } = useCandidate();

  useEffect(() => {
    if (submissionData) {
      setRows(submissionData);
    }
  }, [submissionData]);

 const handleProcessRowUpdate = async (updatedRow: any) => {
    try {
      await editSubmission({
        formId: formId!,
        userEmail: updatedRow.userEmail,
        ...updatedRow,
      });
      return updatedRow;
    } catch (err) {
      console.error("Update failed:", err);
      return updatedRow;

    }

  };

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

  const handleterminate = async(row:any) => {
    await logoutCandidate().unwrap();
    setAuth({ email: null, authorized: null });
    terminateSubmission({formId: formId ?? "", email: row.userEmail})
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
          processRowUpdate={handleProcessRowUpdate}
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
            "& .status-submitted": {
              backgroundColor: "#e6f4ea",
              color: "#2e7d32",
            },
            "& .status-not-submitted": {
              backgroundColor: "#fdecea",
              color: "#d32f2f",
            },
            "& .status-warning": {
              color: "#d32f2f",
            },
          }}
        />
 
      </Box>
    </Box>
  );
};
 
export default SubmissionsPage;
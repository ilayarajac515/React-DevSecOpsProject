import {
    Box,
    Typography,
  } from "@mui/material";
  import { useState } from "react";
  import { DataGridPro, GridColDef, GridRowsProp } from "@mui/x-data-grid-pro";

  import LongMenu from "../components/LogMenu";
  const SubmissionsPage = () => {
    const Logoptions: string[] = ["edit", "delete"];
  
    const columns: GridColDef[] = [
      { field: "Name", headerName: "Name", width: 500 },
      { field: "email", headerName: "Email", width: 150 },
      { field: "warning", headerName: "Warning", width: 150 },
      { field: "duration", headerName: "Duration", width: 150 },
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
  
    const [rows, setRows] = useState<GridRowsProp>([]);
  

    const handleDelete = (row: any) => {
    };
  
    const handleEdit = (row: any) => {
      console.log("Edit action for row:", row);
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
        </Box>
        <Box sx={{ marginTop: "30px", height: "630px" }}>
          <DataGridPro
            columns={columns}
            rows={rows}
          />
        </Box>
      </Box>
    );
  };
  
  export default SubmissionsPage;
  
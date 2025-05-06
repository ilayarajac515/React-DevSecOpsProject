import { Box, Button, Typography } from "@mui/material";
import { DataGridPro, GridColDef} from "@mui/x-data-grid-pro";
 
import LongMenu from "../components/LogMenu";
const SubmissionsPage = () => {
  const Logoptions: string[] = ["edit", "delete"];
 
  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", width: 200 },
    { field: "email", headerName: "Email", width: 300 },
    { field: "warning", headerName: "Warning", width: 100 },
    { field: "start", headerName: "Start Time", width: 100 },
    { field: "end", headerName: "End Time", width: 100 },
    { field: "duration", headerName: "Duration", width: 100 },
    { field: "status", headerName: "Status", width: 200 },
    { field: "score", headerName: "Score", width: 100 ,
      editable:true,
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
        <LongMenu
          handleEdit={() => handleEdit(params.row)}
          handleDelete={() => handleDelete(params.row)}
          Logoptions={Logoptions}
        />
      ),
    },
  ];
 
  // const [rows, setRows] = useState<GridRowsProp>([]);
  type Row = {
    id:number,
      name:string,
      email:string,
      warning:number,
      start:number,
      end:number,
      duration:number,
      status:string,
      score:number,
  }
const rows:Row[] = [{
      id:1,
      name:"Thiru",
      email:"thirumurugankutty@gmail.com",
      warning:3,
      start:0,
      end:1,
      duration:60,
      status:"submitted",
      score:12,
   
    },{
      id:2,
      name:"Karthi",
      email:"karthis15cse@gmail.com",
      warning:10,
      start:0,
      end:1,
      duration:60,
      status:"Not Submitted",
      score:0,
   
    },]
 
  const handleDelete = (row: any) => {};
 
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
        <Button variant="contained" disableElevation>Download</Button>
      </Box>
      <Box sx={{ marginTop: "30px", height: "630px" }}>
        <DataGridPro columns={columns} rows={rows} />
      </Box>
    </Box>
  );
};
 
export default SubmissionsPage;
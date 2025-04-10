import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import LongMenu from './LogMenu';

const columns: GridColDef[] = [
  { field: 'formName', headerName: 'Form Name', width: 250 },
  { field: 'type', headerName: 'Type', width: 250 },
  { field: 'status', headerName: 'Status', width: 250 },
  { field: 'submissions', 
    headerName: 'Submissions', width: 250 },
  { field: 'manager', 
    headerName: 'Manager', 
    width: 250 },
  {
    field: 'actions',
    headerName: '',
    width: 200,
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
    align: 'center',
    renderCell: () => <LongMenu />,
  },
];

const rows = [
  {
    id: 1,
    formName: 'Leave Request',
    type: 'HR',
    status: 'Active',
    submissions: 23,
    manager: 'Jon Snow',
  },
  {
    id: 2,
    formName: 'IT Support',
    type: 'IT',
    status: 'Inactive',
    submissions: 12,
    manager: 'Cersei Lannister',
  },
  {
    id: 3,
    formName: 'Travel Request',
    type: 'Admin',
    status: 'Active',
    submissions: 5,
    manager: 'Jaime Lannister',
  },
  {
    id: 4,
    formName: 'Asset Request',
    type: 'IT',
    status: 'Active',
    submissions: 7,
    manager: 'Arya Stark',
  },
  {
    id: 5,
    formName: 'Feedback',
    type: 'HR',
    status: 'Inactive',
    submissions: 16,
    manager: 'Daenerys Targaryen',
  },
  {
    id: 6,
    formName: 'Reimbursement',
    type: 'Finance',
    status: 'Active',
    submissions: 3,
    manager: 'Markandeyan',
  },
  {
    id: 7,
    formName: 'Security Access',
    type: 'Admin',
    status: 'Active',
    submissions: 11,
    manager: 'Ferrara Clifford',
  },
  {
    id: 8,
    formName: 'Exit Interview',
    type: 'HR',
    status: 'Inactive',
    submissions: 4,
    manager: 'Rossini Frances',
  },
  {
    id: 9,
    formName: 'Performance Review',
    type: 'HR',
    status: 'Active',
    submissions: 6,
    manager: 'Roxie Harvey',
  },
  {
    id: 10,
    formName: 'Leave Approval',
    type: 'HR',
    status: 'Active',
    submissions: 14,
    manager: 'Thiru Murugan',
  },
];

const paginationModel = { page: 0, pageSize: 10 };

export default function DataTable() {
  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        borderRadius: '0px 20px 0px 0px',
      }}
    >
      <Box>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[10]}
          sx={{
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 'bold',
            },
          }}
        />
      </Box>
    </Paper>
  );
}

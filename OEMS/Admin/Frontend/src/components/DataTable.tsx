import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';

type DataTableProps = {
  columns: GridColDef[];
  rows: any[];
};

const paginationModel = { page: 0, pageSize: 10 };

export default function DataTable({ columns, rows }: DataTableProps) {
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

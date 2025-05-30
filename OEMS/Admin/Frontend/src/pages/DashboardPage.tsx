import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupAddIcon from '@mui/icons-material/GroupAdd';

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      sx={{ px: 2 }}
    >
      <Typography variant="h4" gutterBottom sx={{ mt: 5 , mb: 5}}>
        Admin Dashboard
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        <Grid>
          <Paper
            elevation={3}
            sx={{ p: 3, height: 180, width: 400, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <Box>
              <Box display="flex" alignItems="center" mb={2}>
                <AssignmentIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Assessment Manager</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Create , View, edit, and manage all assessment forms.
              </Typography>
            </Box>
            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate('/form-listing-page')}
            >
              Manage Assessments
            </Button>
          </Paper>
        </Grid>

        <Grid>
          <Paper
            elevation={3}
            sx={{ p: 3, height: 180, width: 400, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <Box>
              <Box display="flex" alignItems="center" mb={2}>
                <GroupAddIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Registration Manager</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Create and manage registration forms for candidates.
              </Typography>
            </Box>
            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate('/registration-form-manager')}
            >
              Manage Registrations
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

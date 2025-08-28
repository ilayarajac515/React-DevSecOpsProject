import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

const CircularProgressBar = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginTop: "350px",
        width: "100%",
      }}
    >
      <CircularProgress />
    </Box>
  );
}
export default CircularProgressBar;
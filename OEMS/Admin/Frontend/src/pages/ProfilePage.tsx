import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  Button,
  CircularProgress,
  Divider,
} from "@mui/material";
import { AccountCircle } from "@mui/icons-material";
import { toast } from "react-toastify";
import { useAuth } from "../context/GlobalContext";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { isAdmin, name, email, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!isAdmin || !name || !email)) {
      toast.error("Please log in to view your profile");
      navigate("/");
    }
  }, [isAdmin, name, email, loading, navigate]);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: { xs: 2, sm: 4 },
      }}
    >
      <Card
        sx={{
          maxWidth: 500,
          width: "100%",
          borderRadius: 4,
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
          overflow: "hidden",
          backgroundColor: "#fff",
          transition: "transform 0.3s ease",
        }}
      >
        <Box
          sx={{
            background: "linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)",
            height: 120,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            paddingBottom: 2,
          }}
        >
          <Avatar
            sx={{
              width: 100,
              height: 100,
              border: "4px solid #fff",
              backgroundColor: "#1976d2",
              transform: "translateY(50px)",
            }}
          >
            {name ? (
              <Typography variant="h4" sx={{ color: "#fff" }}>
                {name.charAt(0).toUpperCase()}
              </Typography>
            ) : (
              <AccountCircle sx={{ fontSize: 60 }} />
            )}
          </Avatar>
        </Box>
        <CardContent
          sx={{
            paddingTop: 8,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {loading ? (
            <CircularProgress sx={{ alignSelf: "center" }} />
          ) : isAdmin && name && email ? (
            <>
              <Typography
                variant="h5"
                sx={{ fontWeight: "bold", color: "#333" }}
              >
                {name}
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "#666", marginBottom: 2 }}
              >
                {email}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate("/edit-profile")}
                sx={{ borderRadius: 20, textTransform: "none", paddingX: 4 }}
              >
                Edit Profile
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => navigate("/")}
                sx={{
                  borderRadius: 20,
                  textTransform: "none",
                  paddingX: 4,
                  marginTop: 1,
                }}
              >
                Back to Dashboard
              </Button>
            </>
          ) : (
            <Typography color="error">No user data available</Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfilePage;
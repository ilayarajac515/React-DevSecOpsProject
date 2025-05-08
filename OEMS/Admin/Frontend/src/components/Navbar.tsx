import { useState } from "react";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Avatar,
  MenuItem,
  Tooltip,
} from "@mui/material";
import logo from "../assets/logo.png";
import { logoutUser } from "../Services/adminService";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/GlobalContext";
import { useCandidate } from "../context/CandidateContext";

// Admin-specific color generator
const adminStringToColor = (string: string) => {
  if (!string) return "#424242";
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ("00" + value.toString(16)).slice(-2);
  }
  return color;
};

// Candidate-specific color generator
const candidateStringToColor = (string: string) => {
  if (!string) return "#757575";
  let hash = 1;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 6) - hash); // Different shift to avoid collision
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 6)) & 0xff; // Different mask for added randomness
    color += ("00" + value.toString(16)).slice(-2);
  }
  return color;
};

function Navbar() {
  const location = useLocation();
  const { isAdmin, name, setAuth, email } = useAuth();
  const { email: candidateEmail, authorized } = useCandidate();
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  const adminAvatarInitial = name?.charAt(0).toUpperCase();
  const candidateAvatarInitial = candidateEmail?.charAt(0).toUpperCase();

  const adminAvatarColor = adminStringToColor(name || "");
  const candidateAvatarColor = candidateStringToColor(candidateEmail || "");

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleLogout = () => {
    logoutUser(email!);
    setAuth({ isAdmin: false, name: null, email: null });
    localStorage.removeItem("accessToken");
  };

  const handleCloseMenu = () => {
    setAnchorElUser(null);
  };

  const handleUserLogout = () => {
    handleCloseMenu();
    handleLogout();
    navigate("/");
  };

  const isCandidateRoute =
    location.pathname.startsWith("/assessment-page") ||
    location.pathname.startsWith("/candidate");

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar
        disableGutters
        sx={{
          display: "flex",
          justifyContent: "space-between",
          paddingX: "1.3rem",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <img src={logo} height="40px" alt="Logo" />
        </Box>

        <Box sx={{ flexGrow: 0 }}>
          {/* Admin avatar (shown only on non-candidate routes) */}
          {!isCandidateRoute && isAdmin && name && (
            <>
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar sx={{ backgroundColor: adminAvatarColor }}>
                  {adminAvatarInitial}
                </Avatar>
              </IconButton>
              <Menu
                sx={{ mt: "45px" }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseMenu}
              >
                <MenuItem onClick={handleUserLogout}>
                  <Typography sx={{ textAlign: "center" }}>Logout</Typography>
                </MenuItem>
              </Menu>
            </>
          )}

          {/* Candidate avatar (shown only on candidate routes) */}
          {isCandidateRoute && candidateEmail && authorized && (
            <Tooltip title={candidateEmail}>
              <Avatar sx={{ backgroundColor: candidateAvatarColor }}>
                {candidateAvatarInitial}
              </Avatar>
            </Tooltip>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;

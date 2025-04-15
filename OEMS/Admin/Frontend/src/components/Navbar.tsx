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
} from "@mui/material";
import logo from "../assets/logo.png";
import { logoutUser } from "../Services/UserService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../GlobalContext/GlobalContext";

const stringToColor = (string: string) => {
  if (!string) return "#757575";
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

function Navbar() {
  const {authorized, name, setAuth, email} = useAuth();
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const avatarInitial = name ? name?.charAt(0).toUpperCase() : "";
  const avatarColor = name ? stringToColor(name) : "";
  const navigate = useNavigate();
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleLogout = () => {
    logoutUser(email!);
    setAuth({ authorized: false, name: null , email: null});
    localStorage.removeItem("accessToken");
  };
  console.log(authorized, name, setAuth, email);
  const handleCloseMenu = () => {
    setAnchorElUser(null);
  };
  const handleUserLogout = () => {
    handleCloseMenu();
    handleLogout();
    navigate("/sign-in");
  };
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
          {name && authorized && (
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar sx={{ backgroundColor: avatarColor }}>
                {avatarInitial}
              </Avatar>
            </IconButton>
          )}
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
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;

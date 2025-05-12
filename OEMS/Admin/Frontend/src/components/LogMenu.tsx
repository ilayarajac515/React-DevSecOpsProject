import * as React from "react";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Box, ListItemIcon } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SettingsIcon from "@mui/icons-material/Settings";
import PeopleIcon from "@mui/icons-material/People";

type LongMenuProps = {
  handleEdit?: () => void;
  handleDelete?: () => void;
  handleForm?: () => void;
  handleCopyUrl?: () => void;
  handleCopyApplyUrl?: () => void;
  handleViewSubmissions?: () => void;
  handleViewRegistrations?: () => void;
  handleViewEligibleCandidates?: () => void;
  Logoptions: string[];
};

const LongMenu = ({
  handleEdit,
  handleDelete,
  handleForm,
  handleCopyUrl,
  handleCopyApplyUrl,
  handleViewEligibleCandidates,
  Logoptions = [],
  handleViewSubmissions,
  handleViewRegistrations,
}: LongMenuProps) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      <IconButton
        aria-label="more"
        id="long-button"
        aria-controls={open ? "long-menu" : undefined}
        aria-expanded={open ? "true" : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="long-menu"
        MenuListProps={{
          "aria-labelledby": "long-button",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            style: {
              maxHeight: "unset",
              maxWidth: "unset",
            },
          },
        }}
      >
        {Logoptions.map((option) => (
          <MenuItem
            key={option}
            onClick={() => {
              handleClose();
              if (option === "Edit" && handleEdit) {
                handleEdit();
              }

              if (option === "Delete" && handleDelete) {
                handleDelete();
              }
              if (handleForm && option === "Form builder") {
                handleForm();
              }
              if (handleCopyUrl && option === "Copy test url") {
                handleCopyUrl();
              }
              if (handleCopyApplyUrl && option === "Copy apply url") {
                handleCopyApplyUrl();
              }
              if (option === "View submissions" && handleViewSubmissions) {
                handleViewSubmissions();
              }
              if (option === "View registrations" && handleViewRegistrations) {
                handleViewRegistrations();
              }
              if (
                option === "Eligible candidates" &&
                handleViewEligibleCandidates
              ) {
                handleViewEligibleCandidates();
              }
            }}
          >
            {option === "Edit" && (
              <ListItemIcon>
                <EditRoundedIcon fontSize="small" />
              </ListItemIcon>
            )}
            {option === "Delete" && (
              <ListItemIcon>
                <DeleteIcon fontSize="small" />
              </ListItemIcon>
            )}
            {option === "Form builder" && (
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
            )}
            {option === "Copy test url" && (
              <ListItemIcon>
                <FileCopyIcon fontSize="small" />
              </ListItemIcon>
            )}
            {option === "Copy apply url" && (
              <ListItemIcon>
                <FileCopyIcon fontSize="small" />
              </ListItemIcon>
            )}
            {option === "View submissions" && (
              <ListItemIcon>
                <VisibilityIcon fontSize="small" />
              </ListItemIcon>
            )}
            {option === "View registrations" && (
              <ListItemIcon>
                <VisibilityIcon fontSize="small" />
              </ListItemIcon>
            )}
            {option === "Eligible candidates" && (
              <ListItemIcon>
                <PeopleIcon fontSize="small" />
              </ListItemIcon>
            )}

            {option}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default LongMenu;

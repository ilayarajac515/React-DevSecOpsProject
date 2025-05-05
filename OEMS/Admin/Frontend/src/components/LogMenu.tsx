import * as React from "react";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Box, ListItemIcon } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditNoteIcon from '@mui/icons-material/EditNote';

type LongMenuProps = {
  handleEdit: () => void;
  handleDelete: () => void;
  handleCopyUrl?: () => void;
  handleViewSubmissions?: () => void;
  Logoptions: string[];
};

const LongMenu = ({
  handleEdit,
  handleDelete,
  handleCopyUrl,
  Logoptions = [],
  handleViewSubmissions,
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
              if (option === "edit") handleEdit();
              if (option === "delete") handleDelete();
              if (handleCopyUrl && option === "copy test url")
                handleCopyUrl();
              if (option === "view Submissions" && handleViewSubmissions) {
                handleViewSubmissions();
              }
            }}
          >
            {option === "edit" && (
              <ListItemIcon>
                <EditNoteIcon fontSize="medium" />
              </ListItemIcon>
            )}
            {option === "delete" && (
              <ListItemIcon>
                <DeleteIcon fontSize="small" />
              </ListItemIcon>
            )}
            {option === "copy test url" && (
              <ListItemIcon>
                <FileCopyIcon fontSize="small" />
              </ListItemIcon>
            )}
            {option === "view Submissions" && (
              <ListItemIcon>
                <VisibilityIcon fontSize="small" />
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

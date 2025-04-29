import * as React from "react";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Box, ListItemIcon } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FileCopyIcon from "@mui/icons-material/FileCopy";

type LongMenuProps = {
  handleEdit: () => void;
  handleDelete: () => void;
  handleCopyUrl?: () => void;
  Logoptions: string[];
};

const LongMenu = ({ handleEdit, handleDelete, handleCopyUrl, Logoptions = [] }: LongMenuProps) => {
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
              maxHeight: "40ch",
              width: "25ch",
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
              if (handleCopyUrl && option === "copy public url") handleCopyUrl();
            }}
          >
            {option === "edit" && (
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
            )}
            {option === "delete" && (
              <ListItemIcon>
                <DeleteIcon fontSize="small" />
              </ListItemIcon>
            )}
            {option === "copy public url" && (
              <ListItemIcon>
                <FileCopyIcon fontSize="small" />
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

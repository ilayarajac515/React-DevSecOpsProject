import * as React from "react";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Box } from "@mui/material";


type LongMenuProps = {
  handleEdit: () => void;
  handleDelete: () => void;
  Logoptions:string[];
};

const LongMenu = ({ handleEdit, handleDelete, Logoptions = [] }: LongMenuProps) => {
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
              width: "40ch",
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
            }}
          >
            {option}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};
export default LongMenu;
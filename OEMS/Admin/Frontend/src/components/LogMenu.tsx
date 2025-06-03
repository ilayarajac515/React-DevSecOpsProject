import * as React from "react";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Box, ListItemIcon } from "@mui/material";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FileCopyIcon from "@mui/icons-material/FileCopy";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SettingsIcon from "@mui/icons-material/Settings";
import PeopleIcon from "@mui/icons-material/People";
import ListAltIcon from '@mui/icons-material/ListAlt';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import CloseIcon from '@mui/icons-material/Close';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';

type LongMenuProps = {
  handleEdit?: () => void;
  handleArchive?: () => void;
  handleUnArchive?: () => void;
  handleForm?: () => void;
  handleCopyUrl?: () => void;
  handleCopyApplyUrl?: () => void;
  handleViewSubmissions?: () => void;
  handleViewRegistrations?: () => void;
  handleViewEligibleCandidates?: () => void;
  handleViewEligibleExaminees?: () => void;
  handleViewAnswers?: () => void;
  handlePreviewForm?: () => void;
  handleCloneForm?: () => void;
  handleTerminate?: () => void;
  Logoptions: string[];
};

const LongMenu = ({
  handleEdit,
  handleArchive,
  handleUnArchive,
  handleForm,
  handleCopyUrl,
  handleCopyApplyUrl,
  handleViewEligibleCandidates,
  Logoptions = [],
  handleViewSubmissions,
  handleViewRegistrations,
  handleViewEligibleExaminees,
  handleViewAnswers,
  handlePreviewForm,
  handleCloneForm,
  handleTerminate,
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

              if (option === "Archive" && handleArchive) {
                handleArchive();
              }
              if (option === "UnArchive" && handleUnArchive) {
                handleUnArchive();
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
              if (option === "Eligible candidates" && handleViewEligibleCandidates) {
                handleViewEligibleCandidates();
              }
              if (option === "Eligible examinees" && handleViewEligibleExaminees) {
                handleViewEligibleExaminees();
              }
              if (option === "View Answers" && handleViewAnswers) {
                handleViewAnswers();
              }
              if (option === "Terminate" && handleTerminate) {
                handleTerminate();
              }
              if (option === "Preview Form" && handlePreviewForm) {
                handlePreviewForm();
              }
              if (option === "Clone Form" && handleCloneForm) {
                handleCloneForm();
              }
            }}
          >
            {option === "Edit" && (
              <ListItemIcon>
                <EditRoundedIcon fontSize="small" />
              </ListItemIcon>
            )}

            {option === "Archive" && (
              <ListItemIcon>
                <ArchiveIcon fontSize="small" />
              </ListItemIcon>
            )}
            {option === "UnArchive" && (
              <ListItemIcon>
                <UnarchiveIcon fontSize="small" />
              </ListItemIcon>
            )}
            {option === "Form builder" && (
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
            )}
            {option === "Copy test url" && (
              <ListItemIcon>
                <ContentCopyIcon fontSize="small" />
              </ListItemIcon>
            )}
            {option === "Copy apply url" && (
              <ListItemIcon>
                <ContentCopyIcon fontSize="small" />
              </ListItemIcon>
            )}

            {option === "View submissions" && (
              <ListItemIcon>
                <ListAltIcon fontSize="small" />
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
            {option === "Eligible examinees" && (
              <ListItemIcon>
                <PeopleIcon fontSize="small" />
              </ListItemIcon>
            )}
            {option === "View Answers" && (
              <ListItemIcon>
                <QuestionAnswerIcon fontSize="small" />
              </ListItemIcon>
            )}
            {option === "Terminate" && (
              <ListItemIcon>
                <CloseIcon fontSize="small" />
              </ListItemIcon>
            )}
            {option === "Preview Form" && (
              <ListItemIcon>
                <VisibilityIcon fontSize="small" />
              </ListItemIcon>
            )}
            {option === "Clone Form" && (
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

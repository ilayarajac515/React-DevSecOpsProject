import React, { useRef } from "react";
import Fab from "@mui/material/Fab";
import Draggable from "react-draggable";
import TimerIcon from "@mui/icons-material/Timer";
import { Box } from "@mui/material";

const getFabColor = (elapsedTime: string): "error" | "warning" | "success" => {
  const [min, sec] = elapsedTime.split(":").map(Number);
  const totalSeconds = min * 60 + sec;

  if (totalSeconds <= 300) return "error";
  if (totalSeconds <= 900) return "warning";
  return "success";
};

export const TimerButton = ({ elapsedTime }: { elapsedTime: string }) => {
  const nodeRef = useRef(null) as unknown as React.RefObject<HTMLElement>;
  const fabColor = getFabColor(elapsedTime);

  return (
    <Draggable nodeRef={nodeRef}>
      <Box
        ref={nodeRef}
        style={{
          position: "fixed",
          bottom: 100,
          right: 30,
          zIndex: 1500,
          cursor: "move",
        }}
      >
        <Fab
          variant="extended"
          disableFocusRipple
          disableRipple
          disableTouchRipple
          color={fabColor}
          sx={{
            fontWeight: "bold",
            textTransform: "none",
            px: 3,
          }}
        >
          <TimerIcon sx={{ mr: 1 }} />
          {elapsedTime}
        </Fab>
      </Box>
    </Draggable>
  );
};

import React from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export default function ErrorSnackbar({ open, message, handleClose }) {
  const msgString = message.toString();
  const truncatedMsg =
    msgString.length > 50 ? msgString.substring(0, 50) + "..." : msgString;
  return (
    <Snackbar open={open} autoHideDuration={3000} onClose={handleClose}>
      <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
        {truncatedMsg}
      </Alert>
    </Snackbar>
  );
}

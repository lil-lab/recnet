import * as React from "react";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

export default function AlertDialog({
  open,
  handleClose,
  handleAction,
  text,
  contentText,
  confirmButtonText,
}) {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{text}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {contentText}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleAction} autoFocus>
          {confirmButtonText || "Confirm"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

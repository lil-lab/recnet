import { setUser } from "@/utils/redux/userSlice";
import {
  Avatar,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
  InputAdornment,
} from "@mui/material";
import { useState } from "react";
export default function EditProfilePopUp({ open, handleClose, user }) {
  const [name, setName] = useState(user.displayName);
  const [username, setUsername] = useState(user.username);
  const [organization, setOrganization] = useState(user.organization);

  const [nameError, setNameError] = useState(false);
  const [usernameError, setUsernameError] = useState(false);

  const [nameErrorHelperText, setNameErrorHelperText] = useState("");
  const [usernameErrorHelperText, setUsernameErrorHelperText] = useState("");

  const handleNameChange = (e) => {
    setName(e.target.value);
    if (e.target.value.length === 0) {
      setNameError(true);
      setNameErrorHelperText("Name cannot be blank.");
    } else {
      setNameError(false);
      setNameErrorHelperText("");
    }
  };
  const handleUsernameChange = (e) => {
    let value = e.target.value;
    setUsername(value);
    // Create a regular expression that matches only letters, numbers, and underscores
    var regex = /^[A-Za-z0-9_]+$/;

    if (value < 4 || value > 15 || !regex.test(value)) {
      setUsernameError(true);
      setUsernameErrorHelperText(
        "Username should be between 4 to 15 characters and contain only letters (A-Z, a-z), numbers, and underscores (_)."
      );
    } else {
      setUsernameError(false);
      setUsernameErrorHelperText("");
    }
  };
  const handleOrganizationChange = (e) => {
    setOrganization(e.target.value);
  };

  const handleSubmit = () => {
    // check username is unique
    // update fields
    handleClose();
  };

  function checkDisable(){
    return nameError || usernameError 
  }

  return (
    <>
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          id="name"
          label="Name"
          fullWidth
          variant="outlined"
          value={name}
          onChange={handleNameChange}
          error={nameError}
          helperText={nameErrorHelperText}
        />

        <TextField
          margin="dense"
          id="username"
          label="Username"
          fullWidth
          variant="outlined"
          value={username}
          InputProps={{
            startAdornment: <InputAdornment position="start">@</InputAdornment>,
          }}
          onChange={handleUsernameChange}
          error={usernameError}
          helperText={usernameErrorHelperText}
        />
        <TextField
          margin="dense"
          id="organization"
          label="Organization"
          fullWidth
          variant="outlined"
          value={organization}
          onChange={handleOrganizationChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="secondary">
          Save
        </Button>
      </DialogActions>
    </>
  );
}

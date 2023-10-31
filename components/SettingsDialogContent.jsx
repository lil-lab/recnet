import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  TextField,
  Divider,
} from "@mui/material";
import { useState } from "react";
import LoginButton from "./LoginButton";
import { setUserInfo } from "@/utils/db/user";
import { useSelector } from "react-redux";
import { isUsernameValid } from "@/utils/helpers";

export default function SettingsDialogContent({ handleClose, user, onUpdate }) {
  const userId = useSelector((state) => state.user.id);
  const [name, setName] = useState(user.displayName);
  const [username, setUsernameState] = useState(user.username);
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
    setUsernameState(value);

    if (!isUsernameValid(value)) {
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

  const handleSubmit = async () => {
    const updatedUsername = username === user.username ? undefined : username;
    const updatedOrganization =
      organization === user.organization ? undefined : organization;
    const updatedName = name === user.displayName ? undefined : name;
    const { data, error } = await setUserInfo(
      updatedUsername,
      updatedOrganization,
      updatedName,
      userId
    );
    if (data) {
      handleClose();
      onUpdate();
    } else if (error) {
      if (error.usernameError) {
        setUsernameError(true);
        setUsernameErrorHelperText(error.usernameError);
      } else {
        console.log(error); // TODO: might need to handle other errors
      }
    }
  };

  function checkDisable() {
    const noChange =
      name === user.displayName &&
      username === user.username &&
      organization === user.organization;
    return nameError || usernameError || noChange;
  }

  return (
    <>
      <DialogTitle>Settings</DialogTitle>
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
          label="Organization (optional)"
          fullWidth
          variant="outlined"
          value={organization}
          onChange={handleOrganizationChange}
        />
        <Divider
          textAlign="left"
          flexItem
          sx={{
            marginTop: "3%",
            marginBottom: "3%",
          }}
        ></Divider>
        <LoginButton />
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="secondary"
          disabled={checkDisable()}
        >
          Save
        </Button>
      </DialogActions>
    </>
  );
}

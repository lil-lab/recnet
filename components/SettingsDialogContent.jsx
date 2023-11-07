import { setUserInfo } from "@/utils/db/user";
import { isUsernameValid } from "@/utils/validationHelper";
import { setUser } from "@/utils/redux/userSlice";
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  InputAdornment,
  TextField,
} from "@mui/material";
import { useRouter } from "next/router";
import { useState } from "react";
import { useDispatch } from "react-redux";
import LoginButton from "./LoginButton";

export default function SettingsDialogContent({ handleClose, user, onUpdate }) {
  const [name, setName] = useState(user.displayName);
  const [username, setUsernameState] = useState(user.username);
  const [affiliation, setAffiliation] = useState(user.affiliation);

  const [nameError, setNameError] = useState(false);
  const [usernameError, setUsernameError] = useState(false);

  const [nameErrorHelperText, setNameErrorHelperText] = useState("");
  const [usernameErrorHelperText, setUsernameErrorHelperText] = useState("");

  const router = useRouter();
  const dispatch = useDispatch();

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
  const handleAffiliationChange = (e) => {
    setAffiliation(e.target.value);
  };

  const handleSubmit = async () => {
    const updatedUsername = username === user.username ? undefined : username;
    const updatedAffiliation =
      affiliation === user.affiliation ? undefined : affiliation;
    const updatedName = name === user.displayName ? undefined : name;
    const { data, error } = await setUserInfo(
      updatedUsername,
      updatedAffiliation,
      updatedName,
      user.id
    );
    // dispatch user info in context
    dispatch(setUser({ ...user, ...data }));

    // handle close
    if (data) {
      if (updatedUsername) {
        router.replace(`/${updatedUsername}`);
      }
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
      affiliation === user.affiliation;
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
          id="affiliation"
          label="Affiliation (optional)"
          fullWidth
          variant="outlined"
          value={affiliation}
          onChange={handleAffiliationChange}
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

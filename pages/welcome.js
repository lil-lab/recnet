import styles from "@/styles/Welcome.module.css";
import { useRouter } from "next/router";
import { Typography, TextField, InputAdornment, Button } from "@mui/material";
import { fontStyles } from "@/utils/fonts";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { isUsernameValid } from "@/utils/helpers";
import { setUserInfo } from "@/utils/db/user";
import { setUser } from "@/utils/redux/userSlice";

export default function Welcome() {
  const user = useSelector((state) => state.user.value);
  const userId = useSelector((state) => state.user.id);
  const userLoaded = useSelector((state) => state.user.loaded);
  const dispatch = useDispatch();

  const router = useRouter();
  const [username, setUsername] = useState("");
  const [organization, setOrganization] = useState("");
  const [usernameError, setUsernameError] = useState(false);
  const [usernameErrorHelperText, setUsernameErrorHelperText] = useState("");

  const handleUsernameChange = (e) => {
    let value = e.target.value;
    setUsername(value);

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

  function checkDisable() {
    return usernameError || username.length === 0;
  }

  const handleSubmit = async () => {
    const updatedUsername = username;
    const updatedOrganization = organization;
    const { data, error } = await setUserInfo(
      updatedUsername,
      updatedOrganization,
      undefined,
      userId
    );
    if (data) {
      console.log("here");
      console.log({ ...user, ...data });
      dispatch(setUser({ ...user, ...data }));
      router.push("/");
    } else if (error) {
      if (error.usernameError) {
        setUsernameError(true);
        setUsernameErrorHelperText(error.usernameError);
      } else {
        console.log(error); // TODO: might need to handle other errors
      }
    }
  };

  useEffect(() => {
    if (router) {
      console.log(userLoaded, user);
      // if not logged in
      if (userLoaded && !user) {
        router.push("/");
      }
      // if logged in, user has username, skip welcome
      if (user && user.username) {
        router.push("/");
      }
    }
  }, [userLoaded, user]);

  return (
    user &&
    !user.username && (
      <main className={styles.main}>
        <Typography
          variant="h3"
          sx={{
            ...fontStyles.bold,
            padding: "1%",
          }}
        >
          Welcome to recnet!
        </Typography>
        <Typography
          variant="h6"
          sx={{
            ...fontStyles.regular,
            paddingBottom: "3%",
          }}
        >
          a few additional steps to get you started...
        </Typography>
        <div className={styles.form}>
          <TextField
            margin="dense"
            id="username"
            label="Username"
            fullWidth
            variant="outlined"
            value={username}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">@</InputAdornment>
              ),
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
          <Button
            color="secondary"
            variant="contained"
            disabled={checkDisable()}
            sx={{ marginTop: "5%", marginBottom: "1%" }}
            onClick={handleSubmit}
          >
            Enter
          </Button>
          <Typography variant="body2" color="textSecondary">
            You can change these information later in your profile page.
          </Typography>
        </div>
      </main>
    )
  );
}
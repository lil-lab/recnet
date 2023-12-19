import { useDispatch, useSelector } from "react-redux";
import { clearUser, setUser } from "../utils/redux/userSlice";

import { Button } from "@mui/material";

import { logIn, logOut } from "../utils/db/auth";

import ErrorSnackbar from "@/components/ErrorSnackbar";
import { useRouter } from "next/router";
import { useState } from "react";
import { getUserByEmail } from "../utils/db/user";
import BackLink from "./BackLink";

/** Login button that handles log in and out.
 * @param {boolean} asLink (optional) render as link instead of button
 * @param {string} customText (optional)
 */
export default function LoginButton({ asLink, customText }) {
  const user = useSelector((state) => state.user.value);
  const dispatch = useDispatch();
  const router = useRouter();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleLogout = async () => {
    router.push("/");
    await logOut();
    dispatch(clearUser());
  };

  return user ? (
    asLink ? (
      <BackLink
        onClick={handleLogout}
        text={customText || "log out"}
      ></BackLink>
    ) : (
      <Button
        style={{ marginTop: "1%", marginBottom: "1%" }}
        variant="outlined"
        onClick={handleLogout}
      >
        {customText || "Log out"}
      </Button>
    )
  ) : (
    <Button
      variant="contained"
      color="secondary"
      onClick={async () => {
        const user = await logIn();
        if (user) {
          const { data, error } = await getUserByEmail(user.email);
          if (data && !error) {
            // existing user
            dispatch(setUser(data));
            if (!data.username) {
              // user in db but no username (has invitation code verified)
              router.push("/welcome");
            }
          } else {
            if (!error) {
              // new user - data not in db
              dispatch(setUser(user));
              router.push("/welcome");
            } else {
              setSnackbarMessage(error);
              setSnackbarOpen(true);
            }
          }
        }
      }}
    >
      Sign in with Google 🚀
      <ErrorSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        handleClose={handleSnackbarClose}
      />
    </Button>
  );
}

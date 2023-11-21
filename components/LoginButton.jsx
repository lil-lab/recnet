import { useDispatch, useSelector } from "react-redux";
import { clearUser, setId, setUser } from "../utils/redux/userSlice";

import { Button } from "@mui/material";

import { logIn, logOut } from "../utils/db/auth";

import { useRouter } from "next/router";
import { addUser, getUserByEmail } from "../utils/db/user";
import BackLink from "./BackLink";

/** Login button that handles log in and out.
 * @param {boolean} asLink (optional) render as link instead of button
 * @param {string} customText (optional)
 */
export default function LoginButton({ asLink, customText }) {
  const user = useSelector((state) => state.user.value);
  const dispatch = useDispatch();
  const router = useRouter();

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
          const userData = await getUserByEmail(user.email);
          if (userData) {
            // existing user
            dispatch(setUser(userData));
            dispatch(setId(userData.id));
            if (!userData.username) {
              // no username
              router.push("/welcome");
            }
          } else {
            // new user
            const newUser = await addUser(user);
            dispatch(setUser(newUser));
            dispatch(setId(newUser.id));
            router.push("/welcome");
          }
        }
      }}
    >
      Sign in with Google 🚀
    </Button>
  );
}

import { useDispatch, useSelector } from "react-redux";
import { clearUser, setId, setUser } from "../utils/redux/userSlice";

import { Button } from "@mui/material";

import { logIn, logOut } from "../utils/db/auth";

import { useRouter } from "next/router";
import { addUser, getUserByEmail } from "../utils/db/user";

export default function LoginButton() {
  const user = useSelector((state) => state.user.value);
  const dispatch = useDispatch();
  const router = useRouter();

  return (
    <div>
      {user ? (
        <div>
          <Button
            style={{ marginTop: "10%", marginBottom: "10%" }}
            variant="outlined"
            onClick={async () => {
              router.push("/");
              await logOut();
              dispatch(clearUser());
            }}
          >
            Log out
          </Button>
        </div>
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
              } else {
                // new user
                const newUser = await addUser(user);
                dispatch(setUser(newUser));
                dispatch(setId(newUser.id));
              }
            }
          }}
        >
          Sign in with Google 🚀
        </Button>
      )}
    </div>
  );
}

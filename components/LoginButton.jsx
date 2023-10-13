import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setUser, clearUser, setId } from "../utils/redux/userSlice";

import { Button } from "@mui/material";

import { logIn, logOut } from "../utils/db/auth";

import { getUserByEmail, addUser } from "../utils/db/user";

export default function LoginButton() {
  const user = useSelector((state) => state.user.value);
  const dispatch = useDispatch();

  return (
    <div>
      {user ? (
        <div>
          <Button
            onClick={async () => {
              await logOut();
              dispatch(clearUser());
            }}
          >
            Log out
          </Button>
        </div>
      ) : (
        <Button
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

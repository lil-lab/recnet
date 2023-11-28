import { AppBar, Avatar, IconButton, Toolbar, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setId, setLoaded, setUser } from "../utils/redux/userSlice";
import styles from "./TopBar.module.css";

import { getCurrentUser } from "../utils/db/auth";
import { getUserByEmail } from "../utils/db/user";
import TopBarLink from "./TopBarLink";

import SearchIcon from "@mui/icons-material/Search";
import { useRouter } from "next/router";
import { fontStyles } from "@/utils/fonts";

export default function TopBar() {
  const user = useSelector((state) => state.user.value);
  const userId = useSelector((state) => state.user.id);
  const dispatch = useDispatch();
  const [text, setText] = useState("");

  const router = useRouter();
  const disable = !user || !user.username; // disable top bar clickables

  useEffect(() => {
    // check user logged in
    async function checkUserLoggedIn() {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        const {data, error} = await getUserByEmail(currentUser.email);
        // existing user
        dispatch(setUser(data));
        dispatch(setId(data.id));
        if (error){
          console.error(error)  // need to handle error in parent page
        }
      }
      dispatch(setLoaded());
    }

    if (!user || !userId) checkUserLoggedIn();
  }, []);

  const handleSearch = () => {
    text.trim().length > 0 && router.push(`/searchUsers?q=${text}`);
  };

  return (
    <AppBar position="fixed" sx={{ top: 0 }} elevation={0}>
      <Toolbar sx={{ height: "6rem" }}>
        <TopBarLink
          href="/"
          text="recnet"
          sx={{
            marginLeft: "none",
            display: "flex",
            ...fontStyles.bold,
            letterSpacing: ".3rem",
            textDecoration: "none",
          }}
        />
        <TopBarLink href="/about" text="about" />
        <TopBarLink href="/help" text="help" />
        {!disable && (
          <TopBarLink href="/allUsers" text="all users" sx={{ mr: "auto" }} />
        )}

        <input
          className={styles.searchText}
          placeholder="search user..."
          onChange={(e) => {
            setText(e.target.value);
          }}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
        ></input>

        <IconButton onClick={handleSearch} sx={{ marginRight: "1%" }}>
          <SearchIcon color="white" />
        </IconButton>

        {user && (
          <a
            href={disable ? undefined : `/${user.username}`}
            target="_self"
            rel="noopener"
            align="left"
          >
            <Avatar
              alt="profile"
              src={user.photoURL}
              referrerPolicy="no-referrer"
              style={{ cursor: disable ? "default" : "pointer" }}
            />
          </a>
        )}
      </Toolbar>
    </AppBar>
  );
}

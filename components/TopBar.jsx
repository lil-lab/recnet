import { AppBar, Avatar, IconButton, Toolbar, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setId, setLoaded, setUser } from "../utils/redux/userSlice";
import styles from "./TopBar.module.css";

import { getCurrentUser } from "../utils/db/auth";
import { getUserByEmail } from "../utils/db/user";

import SearchIcon from "@mui/icons-material/Search";
import { useRouter } from "next/router";
import { fontStyles } from "@/utils/fonts";

export default function TopBar() {
  const user = useSelector((state) => state.user.value);
  const userId = useSelector((state) => state.user.id);
  const dispatch = useDispatch();
  const [text, setText] = useState("");

  const router = useRouter();

  useEffect(() => {
    // check user logged in
    async function checkUserLoggedIn() {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        const existingUser = await getUserByEmail(currentUser.email);
        dispatch(setUser(existingUser));
        dispatch(setId(existingUser.id));
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
        <Typography
          variant="h6"
          noWrap
          component="a"
          href="/"
          sx={{
            display: "flex",
            ...fontStyles.bold,
            letterSpacing: ".3rem",
            color: "white",
          }}
        >
          recnet
        </Typography>
        <Typography
          variant="h6"
          noWrap
          component="a"
          href="/about"
          sx={{
            ml: "2%",
            ...fontStyles.regular,
            letterSpacing: ".1rem",
            color: "white",
            flexGrow: 1,
            textDecoration: "underline",
          }}
        >
          about
        </Typography>

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
            href={`/profile?userId=${userId}`}
            target="_self"
            rel="noopener"
            align="left"
          >
            <Avatar
              alt="profile"
              src={user.photoURL}
              referrerPolicy="no-referrer"
              style={{ cursor: "pointer" }}
            />
          </a>
        )}
      </Toolbar>
    </AppBar>
  );
}

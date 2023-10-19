import { AppBar, Avatar, IconButton, Toolbar, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setId, setLoaded, setUser } from "../utils/redux/userSlice";
import styles from "./TopBar.module.css";

import { getCurrentUser } from "../utils/db/auth";
import { getUserByEmail } from "../utils/db/user";

import SearchIcon from "@mui/icons-material/Search";
import { useRouter } from "next/router";

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
    text.trim().length > 0 && router.push(`/searchUser?q=${text}`);
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
            mr: 2,
            display: { xs: "none", md: "flex" },
            fontWeight: 700,
            letterSpacing: ".3rem",
            textDecoration: "none",
            flexGrow: 1,
            color: "white",
          }}
        >
          recnet
        </Typography>

        <input
          className={styles.searchText}
          placeholder="search user..."
          onChange={(e) => {
            setText(e.target.value);
          }}
        ></input>
        <IconButton onClick={handleSearch} className={styles.searchIcon}>
          <SearchIcon />
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

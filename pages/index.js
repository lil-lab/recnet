import styles from "@/styles/Home.module.css";
import { useEffect, useState } from "react";
import YouTube from "react-youtube";

import { Grid, Typography } from "@mui/material";

import ErrorSnackbar from "@/components/ErrorSnackbar";
import LoginButton from "../components/LoginButton";
import ErrorSnackbar from "@/components/ErrorSnackbar";

import { getLastCutoff } from "@/utils/dateHelper";
import {
  getFollowingPostsByDate,
  getPostInProgressByUser,
} from "@/utils/db/post";

import { fontStyles } from "@/utils/fonts";

import FollowingPosts from "@/components/FollowingPosts";
import Help from "@/components/Help";
import Loading from "@/components/Loading";
import { useCheckUser } from "@/utils/hooks";
import LeftBar from "../components/LeftBar";

export default function Home() {
  const { user, userLoaded } = useCheckUser();

  const [posts, setPosts] = useState(-1); // -1 when the page is just loaded; undefined when there's no post
  const [postInProgress, setPostInProgress] = useState(-1);
  const [filter, setFilter] = useState(getLastCutoff());

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    async function getPosts() {
      const { data, error } = await getFollowingPostsByDate(user.id, filter);
      if (error) {
        setSnackbarOpen(true);
        setSnackbarMessage(error);
      } else {
        setPosts(data);
      }
    }

    async function getPostInProgress() {
      const { data, error } = await getPostInProgressByUser(user.id);
      if (error) {
        setSnackbarOpen(true);
        setSnackbarMessage(error);
      } else {
        setPostInProgress(data); // if no post in progress, postInProgress is undefined
      }
    }

    if (userLoaded) {
      if (user && user.id) {
        getPosts();
        getPostInProgress();
      } else {
        // no userId (not logged in), set no post
        setPosts(undefined);
        setPostInProgress(undefined);
      }
    }
  }, [user, userLoaded, filter]);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  function loggedInRegisteredUserContent() {
    return (
      <main
        className={styles.main}
        style={{ flexDirection: "row", padding: "7rem" }}
      >
        {/* Left Sidebar */}
        <div className={styles.left}>
          <LeftBar
            user={user}
            setFilter={setFilter}
            postInProgress={postInProgress}
          />
        </div>

        {/* Middle Content */}
        <div className={styles.mid}>
          {posts ? (
            posts.length === 0 ? (
              <div className={styles.noRecsText}>
                <Typography variant="body1" sx={fontStyles.regular}>
                  No recommendations from your network this week.
                </Typography>
                <Help />
              </div>
            ) : (
              <FollowingPosts posts={posts} />
            )
          ) : (
            <div className={styles.centerLoading}>
              <Loading />
            </div>
          )}
        </div>
      </main>
    );
  }

  function notLoggedInContent() {
    return (
      <main className={styles.main}>
        <Grid container spacing={2}>
          <Grid
            item
            xs={12}
            md={5}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "lightgrey",
            }}
          >
            <Typography
              variant="h1"
              sx={{
                ...fontStyles.bold,
                padding: "1%",
              }}
            >
              recnet
            </Typography>
            <Typography
              variant="h6"
              sx={{
                ...fontStyles.regular,
                paddingBottom: "5%",
              }}
            >
              receive weekly paper recs from researchers you follow.
            </Typography>
            <LoginButton />
          </Grid>
          <Grid
            item
            xs={12}
            md={7}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <YouTube videoId={"qpEvFhNqrn8"} />
          </Grid>
        </Grid>
      </main>
    );
  }

  function loadingContent() {
    return (
      <main
        className={styles.main}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Loading />
      </main>
    );
  }

  return (
    <>
      {userLoaded && posts !== -1 && postInProgress !== -1
        ? user
          ? user.username
            ? loggedInRegisteredUserContent()
            : loadingContent() // there is user but no username: redirect to welcome
          : notLoggedInContent() // no user object: not logged in
        : loadingContent()}
      <ErrorSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        handleClose={handleSnackbarClose}
      />
    </>
  );
}
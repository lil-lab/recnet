import styles from "@/styles/Home.module.css";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { Typography } from "@mui/material";

import LoginButton from "../components/LoginButton";

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
  const userId = useSelector((state) => state.user.id);

  const [posts, setPosts] = useState(-1); // -1 when the page is just loaded; undefined when there's no post
  const [postInProgress, setPostInProgress] = useState(-1);
  const [filter, setFilter] = useState(getLastCutoff());

  useEffect(() => {
    async function getPosts() {
      const { data, error } = await getFollowingPostsByDate(userId, filter);
      if (error){
        console.log(error);
      } else{
        setPosts(data);
      }
    }

    async function getPostInProgress() {
      const { data, error } = await getPostInProgressByUser(userId);
      if (error) {
        console.log(error);
      } else {
        setPostInProgress(data); // if no post in progress, postInProgress is undefined
      }
    }

    if (userLoaded) {
      if (userId) {
        getPosts();
        getPostInProgress();
      } else {
        // no userId (not logged in), set no post
        setPosts(undefined);
        setPostInProgress(undefined);
      }
    }
  }, [user, userId, userLoaded, filter]);

  return (
    <>
      {userLoaded && posts !== -1 && postInProgress !== -1 ? (
        <>
          {user && user.username ? (
            <main className={styles.main} style={{ flexDirection: "row" }}>
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
          ) : (
            <main
              className={styles.main}
              style={{
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
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
                  paddingBottom: "3%",
                }}
              >
                receive weekly paper recs from researchers you follow.
              </Typography>
              <LoginButton />
            </main>
          )}
        </>
      ) : (
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
      )}
    </>
  );
}

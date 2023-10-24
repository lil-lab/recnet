import styles from "@/styles/Home.module.css";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { Typography } from "@mui/material";

import LoginButton from "../components/LoginButton";

import { getLastCutoff, getNextCutoff } from "@/utils/dateHelper";
import { getFollowingPostsByDate, getUserLastPost } from "@/utils/db/post";

import { fontStyles } from "@/utils/fonts";

import FollowingPosts from "@/components/FollowingPosts";
import Loading from "@/components/Loading";
import LeftBar from "../components/LeftBar";

export default function Home() {
  const user = useSelector((state) => state.user.value);
  const userId = useSelector((state) => state.user.id);
  const userLoaded = useSelector((state) => state.user.loaded);

  const [posts, setPosts] = useState(-1); // -1 when the page is just loaded; undefined when there's no post
  const [lastPost, setLastPost] = useState(-1);
  const [filter, setFilter] = useState(getLastCutoff());

  useEffect(() => {
    async function getPosts() {
      const posts = await getFollowingPostsByDate(userId, filter);
      setPosts(posts);
    }

    async function getLastPost() {
      const post = await getUserLastPost(userId);
      setLastPost(post); // if no last post, lastPost is undefined
    }

    if (userLoaded) {
      if (userId) {
        getPosts();
        getLastPost();
      } else {
        // no userId (not logged in), set no post
        setPosts(undefined);
        setLastPost(undefined);
      }
    }
  }, [user, userId, userLoaded, filter]);

  return (
    <>
      {userLoaded && posts !== -1 && lastPost !== -1 ? (
        <>
          {user ? (
            <main className={styles.main} style={{ flexDirection: "row" }}>
              {/* Left Sidebar */}
              <div className={styles.left}>
                <LeftBar
                  user={user}
                  setFilter={setFilter}
                  lastPost={lastPost}
                />
              </div>

              {/* Middle Content */}
              <div className={styles.mid}>
                {posts ? (
                  posts.length === 0 ? (
                    <Typography
                      variant="body1"
                      sx={{
                        ...fontStyles.regular,
                        padding: "10%",
                      }}
                    >
                      No recommendations from your network this week.
                    </Typography>
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

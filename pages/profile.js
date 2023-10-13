import { Avatar, Button, Typography, Link } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import PostCard from "../components/PostCard";
import { useSelector } from "react-redux";
import styles from "@/styles/Profile.module.css";
import { grey } from "@mui/material/colors";
import { fontStyles } from "@/utils/fonts";
import { getPostsByUser } from "@/utils/db/post";
import LoginButton from "@/components/LoginButton";
import { getUserById, followUser, unfollowUser } from "@/utils/db/user";
import AddIcon from "@mui/icons-material/Add";
import BackLink from "@/components/BackLink";

const ProfilePage = () => {
  const router = useRouter();
  const { userId } = router.query; // profile user
  const [user, setUser] = useState(undefined);
  const userLoaded = useSelector((state) => state.user.loaded);
  const currentUserId = useSelector((state) => state.user.id);
  const [posts, setPosts] = useState(undefined);
  const [update, setUpdate] = useState(false); // update user after follow/unfollow action

  useEffect(() => {
    async function getPosts(id) {
      const posts = await getPostsByUser(id);
      setPosts(posts);
    }
    async function getUser(id) {
      const user = await getUserById(id);
      setUser(user);
    }
    if (userLoaded) {
      if (userId) {
        getUser(userId);
        getPosts(userId);
      } else {
        router.push("/");
      }
    }
  }, [userId, userLoaded, router, currentUserId, update]);

  return (
    <main className={styles.main}>
      {user &&
        posts &&
        (user.displayName ? (
          <>
            <Avatar
              alt="profile"
              src={user.photoURL}
              referrerPolicy="no-referrer"
              sx={{ width: 80, height: 80 }}
            />
            <Typography variant="h3" sx={fontStyles.bold}>
              {user.displayName}
            </Typography>
            <Typography variant="h6" sx={fontStyles.regular}>
              {user.email}
            </Typography>
            <Typography variant="h6" sx={fontStyles.regular}>
              <span style={{ fontWeight: "bold" }}>
                {user.followers ? user.followers.length : 0}{" "}
              </span>{" "}
              followers |{" "}
              <span style={{ fontWeight: "bold" }}>
                {user.following ? user.following.length : 0}
              </span>{" "}
              following
            </Typography>
            {userId !== currentUserId &&
              (user.followers && user.followers.includes(currentUserId) ? (
                <Button
                  variant="outlined"
                  color="primary"
                  sx={{ marginTop: 2 }}
                  onClick={async () => {
                    await unfollowUser(userId, currentUserId);
                    setUpdate(!update);
                  }}
                >
                  Unfollow
                </Button>
              ) : (
                <Button
                  startIcon={<AddIcon />}
                  variant="contained"
                  color="secondary"
                  sx={{ marginTop: 2 }}
                  onClick={async () => {
                    await followUser(userId, currentUserId);
                    setUpdate(!update);
                  }}
                >
                  Follow
                </Button>
              ))}
            {userId === currentUserId && <LoginButton />}
            <div className={styles.posts}>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} showDate />
              ))}
            </div>
          </>
        ) : (
          <>
            <Typography variant="h6" sx={fontStyles.regular}>
              {"User doesn't exist."}
            </Typography>
            <BackLink />
          </>
        ))}
    </main>
  );
};

export default ProfilePage;

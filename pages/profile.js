import BackLink from "@/components/BackLink";
import LoginButton from "@/components/LoginButton";
import styles from "@/styles/Profile.module.css";
import { getPostsByUser } from "@/utils/db/post";
import { followUser, getUserById, unfollowUser } from "@/utils/db/user";
import { fontStyles } from "@/utils/fonts";
import AddIcon from "@mui/icons-material/Add";
import { Avatar, Button, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import PostCard from "../components/PostCard";
import FollowButton from "@/components/FollowButton";

const ProfilePage = () => {
  const router = useRouter();
  const { userId } = router.query; // profile userId
  const [user, setUser] = useState(undefined); // profile user
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
  }, [userLoaded, userId, update]);

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
              sx={{ width: "5%", height: "5%" }}
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
            {currentUserId && userId !== currentUserId && (
              <FollowButton
                unFollow={
                  user.followers && user.followers.includes(currentUserId)
                }
                userId={userId}
                currentUserId={currentUserId}
                additionalCallback={() => setUpdate(!update)}
              />
            )}
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

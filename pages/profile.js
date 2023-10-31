import BackLink from "@/components/BackLink";
import SettingsDialogContent from "@/components/SettingsDialogContent";
import FollowButton from "@/components/FollowButton";
import Loading from "@/components/Loading";
import styles from "@/styles/Profile.module.css";
import { getPostsByUser } from "@/utils/db/post";
import { getUserById } from "@/utils/db/user";
import { fontStyles } from "@/utils/fonts";
import { Avatar, Button, Typography, Dialog } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import PostCard from "../components/PostCard";
import SettingsIcon from "@mui/icons-material/Settings";
import CorporateFareIcon from "@mui/icons-material/CorporateFare";
import { useCheckUser } from "@/utils/hooks";

export default function ProfilePage() {
  useCheckUser();
  const router = useRouter();
  const { userId } = router.query; // profile userId
  const [user, setUser] = useState(undefined); // profile user
  const userLoaded = useSelector((state) => state.user.loaded);
  const currentUserId = useSelector((state) => state.user.id);
  const [posts, setPosts] = useState(undefined);
  const [update, setUpdate] = useState(false); // update user after follow/unfollow action
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    async function getPosts(id) {
      const posts = await getPostsByUser(id, false);
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

  if (!user || !posts || !userLoaded)
    return (
      <main className={styles.main}>
        <Loading />
      </main>
    );

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
              sx={{ width: "5vw", height: "5vw" }}
            />
            <Typography variant="h3" sx={fontStyles.bold}>
              {user.displayName}
            </Typography>
            {/* <Typography variant="h6" sx={fontStyles.regular}>
              {user.email}
            </Typography> */}
            {user.username && (
              <Typography
                variant="h6"
                sx={{ ...fontStyles.regular, color: "grey" }}
              >
                {`@ ${user.username}`}
              </Typography>
            )}

            {user.organization && (
              <div className={styles.organization}>
                <CorporateFareIcon />{" "}
                <Typography variant="body1" sx={fontStyles.regular}>
                  {" "}
                  {user.organization}
                </Typography>
              </div>
            )}

            <Typography
              variant="h6"
              sx={{ ...fontStyles.regular, marginTop: "1%" }}
            >
              <span style={{ fontWeight: "bold" }}>
                {user.followers ? user.followers.length : 0}{" "}
              </span>{" "}
              followers |{" "}
              <span style={{ fontWeight: "bold" }}>
                {user.following ? user.following.length : 0}
              </span>{" "}
              following
            </Typography>
            {/* Follow button */}
            {currentUserId && userId !== currentUserId && (
              <FollowButton
                unFollow={
                  user.followers && user.followers.includes(currentUserId)
                }
                userId={userId}
                currentUserId={currentUserId}
                additionalCallback={() => setUpdate(!update)}
                style={{ marginTop: "1%", marginBottom: "1%" }}
              />
            )}

            {/* Edit profile */}
            {userId === currentUserId && (
              <Button
                variant="outlined"
                style={{ marginTop: "1%", marginBottom: "1%" }}
                onClick={handleClickOpen}
                startIcon={<SettingsIcon />}
              >
                Settings
              </Button>
            )}
            <Dialog open={open} onClose={handleClose} keepMounted={false}>
              <SettingsDialogContent
                handleClose={handleClose}
                user={user}
                onUpdate={() => setUpdate(!update)}
              />
            </Dialog>

            {/* Posts */}
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
}

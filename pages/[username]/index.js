import BackLink from "@/components/BackLink";
import FollowButton from "@/components/FollowButton";
import FollowStatsCard from "@/components/FollowStatsCard";
import InfoText from "@/components/InfoText";
import Loading from "@/components/Loading";
import PostCard from "@/components/PostCard";
import SettingsDialogContent from "@/components/SettingsDialogContent";
import ErrorSnackbar from "@/components/ErrorSnackbar";
import styles from "@/styles/Profile.module.css";
import { getPostsByUser } from "@/utils/db/post";
import { getUserByUsername } from "@/utils/db/user";
import { fontStyles } from "@/utils/fonts";
import SettingsIcon from "@mui/icons-material/Settings";
import { Avatar, Button, Dialog, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function ProfilePage() {
  const router = useRouter();
  const { username } = router.query;
  const [user, setUser] = useState(undefined); // profile user
  const currentUser = useSelector((state) => state.user.value);
  const currentUserLoaded = useSelector((state) => state.user.loaded);
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState(undefined);
  const [update, setUpdate] = useState(false); // update user after follow/unfollow action
  const [open, setOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleFollowingPageOpen = () => {
    if (username) {
      router.push(`/${username}/following`);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    async function getPosts(id) {
      const { data, error } = await getPostsByUser(id, false);
      if (error){
        setSnackbarMessage(error);
        setSnackbarOpen(true);
      } else{
        setPosts(data);
      }
    }

    async function getUser(username) {
      const { data, error } = await getUserByUsername(username);
      if (error){
        setSnackbarOpen(true);
        setSnackbarMessage(error);
      } else{
        setUser(data);
        return data;
      }
    } 
    setIsLoading(true);

    if (username) {
      getUser(username)
        .then((user) => {
          user && getPosts(user.id);
          setIsLoading(false);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [update, username]);

  if (isLoading) {
    return (
      <main className={styles.main}>
        <Loading />
      </main>
    );
  } else if (!user) {
    return (
      <main className={styles.main}>
        <InfoText>{"User doesn't exist."}</InfoText>
        <BackLink route="/" text="back to homepage" />
      </main>
    );
  }

  return (
    <main className={styles.main}>
      {currentUserLoaded &&
        user &&
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

            {/* Follow stats */}
            <FollowStatsCard
              user={user}
              currentUser={currentUser}
              onFollowingClick={handleFollowingPageOpen}
            />
            {/* Follow button */}
            {currentUser &&
              currentUser.username &&
              user.id !== currentUser.id && (
                <FollowButton
                  unFollow={
                    user.followers && user.followers.includes(currentUser.id)
                  }
                  userId={user.id}
                  currentUserId={currentUser.id}
                  additionalCallback={() =>
                    // update user followers locally
                    setUser({
                      ...user,
                      followers:
                        user.followers &&
                        user.followers.includes(currentUser.id)
                          ? user.followers.filter((u) => u !== currentUser.id)
                          : (user.followers || []).concat([currentUser.id]),
                    })
                  }
                  style={{ marginTop: "1%", marginBottom: "1%" }}
                />
              )}

            {/* Edit profile */}
            {currentUser && user.id === currentUser.id && (
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
            <InfoText>{"User doesn't exist."}</InfoText>
            <BackLink route="/" text="back to homepage" />
          </>
        ))}
        <ErrorSnackbar
          open={snackbarOpen}
          message={snackbarMessage}
          handleClose={handleSnackbarClose}
      />
    </main>
  );
}

import BackLink from "@/components/BackLink";
import { useEffect, useState } from "react";
import UserCard from "@/components/UserCard";
import { getUsers } from "@/utils/db/user";
import Loading from "@/components/Loading";
import profilestyles from "@/styles/Profile.module.css";
import styles from "@/styles/Following.module.css";
import { useSelector } from "react-redux";
import Typography from "@mui/material/Typography";
import { fontStyles } from "@/utils/fonts";
import ErrorSnackbar from "@/components/ErrorSnackbar";

export default function FollowingPage() {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = useSelector((state) => state.user.value);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    async function loadFollowing() {
      if (currentUser?.id) {
        setLoading(true);
        const { data, error } = await getUsers(currentUser.following);

        if (data) {
          setFollowing(data);
        } else {
          setSnackbarOpen(true);
          setSnackbarMessage(error);
        }
        setLoading(false);
      }
    }

    loadFollowing();
  }, [currentUser]);

  const updateUser = (userIdToUpdate, newFollowers) => {
    setFollowing(
      following.map((user) =>
        user.id === userIdToUpdate ? { ...user, followers: newFollowers } : user
      )
    );
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (loading) {
    return (
      <main className={profilestyles.main}>
        <Loading />
      </main>
    );
  }

  return (
    <>
      <main className={styles.main}>
        {following.length === 0 ? (
          <div className={styles.noFollowingsText}>
            <Typography variant="h6" sx={fontStyles.regular}>
              You are not following anyone yet.
            </Typography>
          </div>
        ) : (
          following.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              width={"80%"}
              currentUserId={currentUser.id}
              updateUser={updateUser}
            />
          ))
        )}
        {
          <div style={{ paddingTop: "25px" }}>
            <BackLink
              route={`/${currentUser.username}`}
              text="back to profile"
            />
          </div>
        }
        <ErrorSnackbar
          open={snackbarOpen}
          message={snackbarMessage}
          handleClose={handleSnackbarClose}
        />
      </main>
    </>
  );
}

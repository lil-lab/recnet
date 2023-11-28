import BackLink from "@/components/BackLink";
import UserCard from "@/components/UserCard";
import styles from "@/styles/Search.module.css";
import { searchUsers } from "@/utils/db/user";
import { fontStyles } from "@/utils/fonts";
import { Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Loading from "@/components/Loading";
import ErrorSnackbar from "@/components/ErrorSnackbar";

export default function SearchUsers() {
  const router = useRouter();
  const { q } = router.query;
  const [users, setUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(true);
  const currentUser = useSelector((state) => state.user.value);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    async function getUsers(query) {
      setUserLoading(true);
      const {data, error} = await searchUsers(query);
      if (data) {
        setUsers(data);
    } else {
        setSnackbarOpen(true);
        setSnackbarMessage(error);
      }
      setUserLoading(false);
    }

    if (q) {
      getUsers(q);
    }
  }, [q]);

  // update local user info follow/unfollow
  const updateUser = (userId, newFollowers) => {
    setUsers(
      users.map((user) => {
        if (user.id === userId) {
          return { ...user, followers: newFollowers };
        }
        return user;
      })
    );
  };
  
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  
  if (userLoading)
    return (
      <main className={styles.main}>
        <Loading />
      </main>
    );

  return (
    <main className={styles.main}>
      {!userLoading &&
        (users.length === 0 ? (
          <Typography variant="h6" sx={fontStyles.regular}>
            {"No user matches the search. Search users by name or username."}
          </Typography>
        ) : (
          users.map((user, index) => (
            <UserCard
              key={index}
              user={user}
              width={"80%"}
              updateUser={updateUser}
              currentUser={currentUser}
            />
          ))
        ))}
        <ErrorSnackbar
          open={snackbarOpen}
          message={snackbarMessage}
          handleClose={handleSnackbarClose}
        />
        <BackLink route="/" text="back to homepage" />
    </main>
  );
}

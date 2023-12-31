import React, { useEffect, useState } from "react";
import UserCard from "@/components/UserCard";
import Loading from "@/components/Loading";
import ErrorSnackbar from "@/components/ErrorSnackbar";
import Typography from "@mui/material/Typography";
import { useSelector } from "react-redux";
import { getAllUsers } from "@/utils/db/user";
import styles from "@/styles/AllUsers.module.css";
import { useCheckUser } from "@/utils/hooks";
import InfoText from "@/components/InfoText";

export default function AllUsersPage() {
  useCheckUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const currentUser = useSelector((state) => state.user.value);

  useEffect(() => {
    async function loadAllUsers() {
      setLoading(true);
      const { data, error } = await getAllUsers();

      if (data) {
        setUsers(data);
      } else {
        setSnackbarOpen(true);
        setSnackbarMessage(error);
      }
      setLoading(false);
    }

    loadAllUsers();
  }, []);

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

  if (loading) {
    return (
      <main className={styles.main}>
        <Loading />
      </main>
    );
  }

  return (
    <main className={styles.main}>
      {users.length === 0 ? (
        <InfoText>No users yet.</InfoText>
      ) : (
        users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            width={"80%"}
            updateUser={updateUser}
            currentUser={currentUser}
          />
        ))
      )}
      <ErrorSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        handleClose={handleSnackbarClose}
      />
    </main>
  );
}

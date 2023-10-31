import { useEffect, useState } from "react";
import { getUserById, followUser, unfollowUser } from "@/utils/db/user";
import UserCard from "@/components/UserCard";
import { fontStyles } from "@/utils/fonts";
import { Modal, IconButton, Box, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import modalStyles from "@/styles/FollowingModal.module.css";
import profileStyles from "@/styles/Profile.module.css";
import Loading from "@/components/Loading";

export default function FollowingModal({ userId, open, onClose, currentUserId, onUserUpdate }) {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFollowing() {
      setLoading(true);
      if (userId) {
        const user = await getUserById(userId);
        if (user && user.following) {
          const followingUsersPromises = user.following.map((followingId) => getUserById(followingId));
          const followingUsers = await Promise.all(followingUsersPromises);
          setFollowing(followingUsers.filter(Boolean)); // Filter out any undefined values
        }
      }
      setLoading(false);
    }

    if (open) {
      loadFollowing();
    }

    // Reset the following state when the modal is closed
    return () => {
      if (!open) {
        setFollowing([]);
      }
    };
  }, [userId, open]);

  const updateUser = async (userIdToUpdate, isFollowing) => {
    try {
      if (isFollowing) {
        await unfollowUser(userIdToUpdate, currentUserId);
      } else {
        await followUser(userIdToUpdate, currentUserId);
      }
      setFollowing((prevFollowing) => {
        return prevFollowing.map((user) => {
          if (user.id === userIdToUpdate) {
            return {
              ...user,
              followers: isFollowing
                ? user.followers.filter((id) => id !== currentUserId)
                : [...user.followers, currentUserId],
            };
          }
          return user;
        });
      });
  
      onUserUpdate();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };  
  
  
  if (loading) {
    return (
      <main className={profileStyles.main}>
        <Loading />
      </main>
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="following-modal-title"
      aria-describedby="following-modal-description"
    >
      <Box className={modalStyles.modalBox}>
        <IconButton onClick={onClose} className={modalStyles.closeButton}>
          <CloseIcon />
        </IconButton>
        {following.length === 0 ? (
          <Typography variant="body1" sx={fontStyles.regular}>
            No users followed yet.
          </Typography>
        ) : (
          following.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              currentUserId={currentUserId}
              updateUser={(userIdToUpdate, isFollowing) => updateUser(userIdToUpdate, isFollowing)}
            />
          ))
        )}
      </Box>
    </Modal>
  );
}
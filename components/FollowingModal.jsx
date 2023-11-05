import React, { useEffect, useState } from 'react';
import { Modal, Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import UserCard from '@/components/UserCard';
import { getUsers } from "@/utils/db/user";
import styles from './FollowingModal.module.css';
import Loading from "@/components/Loading";

const FollowingModal = ({ open, onClose, currentUserId, onUserUpdate, followingIds }) => {
  const [followingUsers, setFollowingUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && followingIds.length > 0) {
      setLoading(true);
      const loadFollowing = async () => {
        const { data, error } = await getUsers(followingIds);
        if (data) {
          setFollowingUsers(data);
        } else {
          console.error('Error fetching users:', error);
        }
        setLoading(false);
      };
  
      loadFollowing();
    }
  }, [open, followingIds]);

  const updateUser = (userIdToUpdate, newFollowers) => {
    setFollowingUsers(followingUsers.map(user =>
      user.id === userIdToUpdate ? { ...user, followers: newFollowers } : user
    ));
    onUserUpdate();
  };

  // Render loading inside the modal if the data is being fetched.
  const renderContent = () => {
    if (loading) {
      return <Loading />;
    }

    return (
      <Box>
        {followingUsers.length > 0 ? (
          followingUsers.map(user => (
            <UserCard
              key={user.id}
              user={user}
              currentUserId={currentUserId}
              updateUser={updateUser}
            />
          ))
        ) : (
          <Typography sx={{ textAlign: 'center' }}>
            No users followed.
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        onClose();
        // Optionally, delay resetting followingUsers if there is a closing transition
        setTimeout(() => setFollowingUsers([]), 300); // Assume a 300ms transition
      }}
    >
      <Box className={styles.modalBox}>
        <IconButton className={styles.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          Following
        </Typography>
        {renderContent()}
      </Box>
    </Modal>
  );
};

export default FollowingModal;

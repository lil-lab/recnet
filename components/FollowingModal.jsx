import React, { useEffect, useState } from 'react';
import { Modal, Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import UserCard from '@/components/UserCard';
import { getUsers } from "@/utils/db/user";
import styles from './FollowingModal.module.css'; // Import your custom CSS module

const FollowingModal = ({ userId, open, onClose, currentUserId, followingIds }) => {
  const [followingUsers, setFollowingUsers] = useState([]);

  useEffect(() => {
    console.log('Modal opened:', open); // log the modal open status
    console.log('Following IDs:', followingIds); // log the IDs to fetch
    if (open && followingIds && followingIds.length > 0) {
      const fetchFollowingUsers = async () => {
        console.log('Fetching users for IDs:', followingIds); // log fetch attempt
        const { data, error } = await getUsers(followingIds);
        console.log('Fetched data:', data); // log fetched data
        if (data) {
          setFollowingUsers(data);
        } else {
          console.error('Error fetching users:', error); // Log any errors
        }
      };
      fetchFollowingUsers();
    } else {
      setFollowingUsers([]); // clear if modal is closed/no IDs provided
      console.log('Following list cleared.'); // log clearing of the list
    }
  }, [open, followingIds]);

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

  return (
    <Modal open={open} onClose={onClose}>
      <Box className={styles.modalBox}>
        <IconButton className={styles.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          Following
        </Typography>
        <Box>
          {followingUsers.length > 0 ? (
            followingUsers.map((user) => (
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
      </Box>
    </Modal>
  );
};

export default FollowingModal;

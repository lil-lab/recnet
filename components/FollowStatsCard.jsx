import React from 'react';
import { Typography } from '@mui/material';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import styles from "@/styles/Profile.module.css";
import { fontStyles } from "@/utils/fonts";

const FollowStatsCard = ({ user, currentUser, onFollowingClick }) => {
  return (
    <>
      {/* User Affiliation */}
      {user.affiliation && (
        <div className={styles.affiliation}>
          <CorporateFareIcon />{" "}
          <Typography variant="body1" sx={fontStyles.regular}>
            {" "}
            {user.affiliation}
          </Typography>
        </div>
      )}

      {/* Followers and Following */}
      <Typography variant="h6" sx={{ ...fontStyles.regular, marginTop: "1%" }}>
        <span style={{ fontWeight: "bold" }}>
          {user.followers ? user.followers.length : 0}{" "}
        </span>{" "}
        followers |{" "}
        {currentUser && user.id === currentUser.id ? (
          <>
            <span
              style={{ fontWeight: "bold", cursor: "pointer" }}
              onClick={onFollowingClick}
            >
              {user.following ? user.following.length : 0}
            </span>{" "}
            <span
              style={{ textDecoration: "underline", cursor: "pointer" }}
              onClick={onFollowingClick}
            >
              following
            </span>
          </>
        ) : (
          <>
            <span style={{ fontWeight: "bold" }}>
              {user.following ? user.following.length : 0}
            </span>{" "}
            following
          </>
        )}
      </Typography>
    </>
  );
};

export default FollowStatsCard;

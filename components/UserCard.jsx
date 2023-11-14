import { Avatar, Paper, Typography } from "@mui/material";

import { fontStyles } from "@/utils/fonts";
import styles from "./UserCard.module.css";
import FollowButton from "./FollowButton";

export default function UserCard({ user, width, currentUserId, updateUser }) {
  return (
    <Paper
      className={styles.paper}
      sx={{
        borderRadius: 8,
        width: width ?? "100%",
      }}
    >
      <a
        href={`/${user.username}`}
        target="_self"
        rel="noopener"
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        <Avatar
          alt="profile"
          src={user.photoURL}
          referrerPolicy="no-referrer"
          sx={{ width: "5vw", height: "5vw" }}
        />
        <Typography variant="h4" sx={{ ...fontStyles.bold, marginLeft: "3%" }}>
          {user.displayName}
        </Typography>
        {/* <Typography
          variant="body1"
          sx={{ ...fontStyles.regular, marginLeft: "3%" }}
        >
          {user.email}
        </Typography> */}
        <Typography
          variant="body1"
          sx={{ ...fontStyles.regular, marginLeft: "3%", color: "grey" }}
        >
          {"@ " + user.username}
        </Typography>
      </a>
      {currentUserId && user.id !== currentUserId && (
        <FollowButton
          unFollow={user.followers && user.followers.includes(currentUserId)}
          userId={user.id}
          currentUserId={currentUserId}
          additionalCallback={() =>
            updateUser(
              user.id,
              user.followers && user.followers.includes(currentUserId)
                ? user.followers.filter((u) => u !== currentUserId)
                : (user.followers || []).concat([currentUserId])
            )
          }
        />
      )}
    </Paper>
  );
}

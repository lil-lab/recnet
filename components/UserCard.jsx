import { Avatar, Paper, Typography } from "@mui/material";

import { fontStyles } from "@/utils/fonts";
import styles from "./UserCard.module.css";
import { useRouter } from "next/router";
import FollowButton from "./FollowButton";

export default function UserCard({ user, width }) {
  return (
    <a
      href={`/profile?userId=${user.id}`}
      target="_blank"
      rel="noopener"
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper
        className={styles.paper}
        sx={{
          borderRadius: 8,
          width: width ?? "100%",
        }}
      >
        <Avatar
          alt="profile"
          src={user.photoURL}
          referrerPolicy="no-referrer"
          sx={{ width: "5%", height: "5%" }}
        />
        <Typography className={styles.item} variant="h4" sx={fontStyles.bold}>
          {user.displayName}
        </Typography>
        <Typography
          className={styles.item}
          variant="body1"
          sx={fontStyles.regular}
        >
          {user.email}
        </Typography>
      </Paper>
    </a>
  );
}

import { Avatar, Paper, Typography } from "@mui/material";

import { fontStyles } from "@/utils/fonts";
import styles from "./UserCard.module.css";
import { useRouter } from "next/router";
import FollowButton from "./FollowButton";

/** UserCard displays basica user info and a follow/unfollow button.
 * @param {object} props
 * @param {object} props.user
 * @param {string} props.width
 * @param {string} props.currentUserId
 * @param {(userId, newFollowers) => void} props.updateUser callback to send to parent the updated followers list of the user of this UserCard
 */
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
        href={`/profile?userId=${user.id}`}
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
        <Typography
          variant="body1"
          sx={{ ...fontStyles.regular, marginLeft: "3%" }}
        >
          {user.email}
        </Typography>
      </a>
      {currentUserId && user.id !== currentUserId && (
        <FollowButton
          unFollow={user.followers && user.followers.includes(currentUserId)}
          userId={user.id}
          currentUserId={currentUserId}
          additionalCallback={() =>
            updateUser &&
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

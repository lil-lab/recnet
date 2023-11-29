import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { followUser, unfollowUser } from "@/utils/db/user";

export default function FollowButton({
  unFollow,
  additionalCallback,
  userId,
  currentUserId,
  style
}) {
  return unFollow ? (
    <Button
      variant="outlined"
      color="primary"
      sx={style}
      onClick={async () => {
        const { data, error } = await unfollowUser(userId, currentUserId);
        additionalCallback(error);
      }}
    >
      Unfollow
    </Button>
  ) : (
    <Button
      startIcon={<AddIcon />}
      variant="contained"
      color="secondary"
      sx={style}
      onClick={async () => {
        const { data, error } = await followUser(userId, currentUserId);
        additionalCallback(error);
      }}
    >
      Follow
    </Button>
  );
}

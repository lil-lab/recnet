import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import UserCard from "@/components/UserCard";
import { getUserById, followUser, unfollowUser } from "@/utils/db/user";
import Loading from "@/components/Loading";
import styles from "@/styles/Following.module.css";
import { useSelector } from "react-redux";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { fontStyles } from "@/utils/fonts";

const FollowingPage = () => {
  const router = useRouter();
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUserId = useSelector((state) => state.user.id);

  useEffect(() => {
    async function loadFollowing() {
      const urlParams = router.query.userid?.split('/');
      const userId = urlParams?.[0];

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

    loadFollowing();
  }, [router.query.userid]);

  const updateUser = async (userId, isFollowing) => {
    try {
      if (isFollowing) {
        await unfollowUser(userId, currentUserId);
      } else {
        await followUser(userId, currentUserId);
      }
      // Update the following list to reflect the change
      setFollowing((prevFollowing) =>
        prevFollowing.map((user) => {
          if (user.id === userId) {
            return {
              ...user,
              followers: isFollowing
                ? user.followers.filter((id) => id !== currentUserId)
                : [...user.followers, currentUserId],
            };
          }
          return user;
        })
      );
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  if (loading) {
    return (
      <main className={styles.main}>
        <Loading />
      </main>
    );
  }

  if (following.length === 0) {
    return (
      <main className={styles.main}>
        <p>No users followed yet.</p>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <Link href={`/profile?userId=${currentUserId}`} style={{ marginBottom: "2%" }}>
        <Typography variant="body2" sx={fontStyles.regular}>
          Back to profile
        </Typography>
      </Link>
      {following.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          currentUserId={currentUserId}
          updateUser={(userId, isFollowing) => updateUser(userId, isFollowing)}
        />
      ))}
    </main>
  );
};

export default FollowingPage;
import BackLink from "@/components/BackLink";
import UserCard from "@/components/UserCard";
import styles from "@/styles/Search.module.css";
import { searchUsers } from "@/utils/db/user";
import { fontStyles } from "@/utils/fonts";
import { Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Loading from "@/components/Loading";
import InfoText from "@/components/InfoText";

export default function SearchUsers() {
  const router = useRouter();
  const { q } = router.query;
  const [users, setUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(true);
  const currentUser = useSelector((state) => state.user.value);

  useEffect(() => {
    async function getUsers(query) {
      setUserLoading(true);
      const users = await searchUsers(query);
      setUsers(users);
      setUserLoading(false);
    }

    if (q) {
      getUsers(q);
    }
  }, [q]);

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

  if (userLoading)
    return (
      <main className={styles.main}>
        <Loading />
      </main>
    );

  return (
    <main className={styles.main}>
      {!userLoading &&
        (users.length === 0 ? (
          <InfoText>
            No user matches the search. Search users by name or username.
          </InfoText>
        ) : (
          users.map((user, index) => (
            <UserCard
              key={index}
              user={user}
              width={"80%"}
              updateUser={updateUser}
              currentUser={currentUser}
            />
          ))
        ))}

      <BackLink route="/" text="back to homepage" />
    </main>
  );
}

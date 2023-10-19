import BackLink from "@/components/BackLink";
import UserCard from "@/components/UserCard";
import styles from "@/styles/Search.module.css";
import { searchUsers } from "@/utils/db/user";
import { fontStyles } from "@/utils/fonts";
import { Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function SearchUser() {
  const router = useRouter();
  const { q } = router.query;
  const [users, setUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(true);

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

  return (
    <main className={styles.main}>
      {!userLoading &&
        (users.length === 0 ? (
          <Typography variant="h6" sx={fontStyles.regular}>
            {"No user matches the search. Search users by name or email."}
          </Typography>
        ) : (
          users.map((user, index) => (
            <UserCard key={index} user={user} width={"80%"} />
          ))
        ))}

      <BackLink />
    </main>
  );
}

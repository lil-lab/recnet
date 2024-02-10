import { User } from "@/types/user";
import { db } from "@/firebase/admin";
import { Filter } from "firebase-admin/firestore";
import { UserSchema } from "@/types/user";
import { notEmpty } from "@/utils/notEmpty";
import { UserCard } from "@/components/UserCard";
import { DocumentData } from "firebase-admin/firestore";
import { cn } from "@/utils/cn";
import { Grid, Text } from "@radix-ui/themes";
import { NotFoundBlock } from "./NotFound";
import { GoBackButton } from "@/components/GoBackButton";

const capitalize = (s: string) => {
  const words = s.split(" ");

  return words
    .map((word) => word[0].toUpperCase() + word.substring(1))
    .join(" ");
};

async function getSearchResults(query: string): Promise<User[]> {
  const q = query.trim().replace(/ +(?= )/g, "");

  function checkUsers(users: DocumentData[]) {
    const res = users
      .filter((user) => {
        return (
          user.username && // registered user (with username)
          !user.test // filter out test accounts
        );
      })
      .map((user) => {
        // validation for user schema
        const checkResult = UserSchema.safeParse(user);
        if (!checkResult.success) {
          console.log(checkResult.error);
          return null;
        }
        return checkResult.data;
      })
      .filter(notEmpty);
    // remove duplicates
    const seen = new Set();
    return res.filter((user) => {
      const duplicate = seen.has(user.username);
      seen.add(user.username);
      return !duplicate;
    });
  }
  // edge case: empty query
  // return all users
  if (query.length === 0) {
    const allUsers = await db.collection("users").get();
    return checkUsers(
      allUsers.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
    );
  }
  //search by username
  const usernameQuerySnapshot = await db
    .collection("users")
    .where("username", ">=", q)
    .where("username", "<=", q + "\uf8ff")
    .get();

  // search by dsiplayName
  const nameFilter = Filter.or(
    Filter.and(
      Filter.where("displayName", ">=", q),
      Filter.where("displayName", "<=", q + "\uf8ff")
    ),
    Filter.and(
      Filter.where("displayName", ">=", capitalize(q)),
      Filter.where("displayName", "<=", capitalize(q) + "\uf8ff")
    )
  );
  const nameQuerySnapshot = await db
    .collection("users")
    .where(nameFilter)
    .get();

  const results = [
    ...usernameQuerySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })),
    ...nameQuerySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })),
  ];

  return checkUsers(results);
}

export default async function SearchResultPage({
  searchParams,
}: {
  searchParams: {
    q: string;
  };
}) {
  const query = searchParams["q"];
  const results = await getSearchResults(query);
  return (
    <div
      className={cn(
        "w-full",
        "lg:w-[60%]",
        `min-h-[90svh]`,
        "flex",
        "flex-col",
        "p-8",
        "gap-y-6"
      )}
    >
      <GoBackButton />
      <Text
        size="7"
        className="text-gray-12 font-medium"
      >{`${results.length} result${results.length > 1 ? "s" : ""}`}</Text>
      {results.length === 0 ? (
        <NotFoundBlock />
      ) : (
        <Grid
          columns={{
            initial: "1",
            sm: "2",
            md: "3",
          }}
          gap="4"
        >
          {results.map((user, idx) => (
            <UserCard key={`${user.username}-${idx}`} user={user} />
          ))}
        </Grid>
      )}
    </div>
  );
}

import { User } from "@/types/user";
import { db } from "@/firebase/admin";
import { UserSchema } from "@/types/user";
import { notEmpty } from "@/utils/notEmpty";
import { UserCard } from "@/components/UserCard";
import { DocumentData } from "firebase-admin/firestore";
import { cn } from "@/utils/cn";
import { Grid, Text } from "@radix-ui/themes";
import { GoBackButton } from "@/components/GoBackButton";
import { NotFoundBlock } from "@/app/search/NotFound";

async function getSearchResults(): Promise<User[]> {
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
  const allUsers = await db.collection("users").get();
  return checkUsers(
    allUsers.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
  );
}

export default async function SearchResultPage() {
  const results = await getSearchResults();
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
      <Text size="7" className="text-gray-12 font-medium">{`All users`}</Text>
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

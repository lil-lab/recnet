import { User } from "@recnet/recnet-web/types/user";
import { db } from "@recnet/recnet-web/firebase/admin";
import { UserSchema } from "@recnet/recnet-web/types/user";
import { notEmpty } from "@recnet/recnet-web/utils/notEmpty";
import { UserList } from "@recnet/recnet-web/components/UserCard";
import { DocumentData } from "firebase-admin/firestore";
import { cn } from "@recnet/recnet-web/utils/cn";
import { Text } from "@radix-ui/themes";
import { GoBackButton } from "@recnet/recnet-web/components/GoBackButton";
import { NotFoundBlock } from "@recnet/recnet-web/app/search/NotFound";

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
      {results.length === 0 ? <NotFoundBlock /> : <UserList users={results} />}
    </div>
  );
}

import { getUserByUsername } from "@/server/user";
import { UserSchema } from "@/types/user";
import { notFound } from "next/navigation";

export default async function UserProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const { username } = params;
  const user = await getUserByUsername(username)
    .then((res) => UserSchema.parse(res))
    .catch((e) => {
      console.error(e);
      // redirect to 404
      notFound();
    });

  return (
    <div>
      <h1>{user?.displayName}</h1>
    </div>
  );
}

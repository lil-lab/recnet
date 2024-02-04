import { cn } from "@/utils/cn";
import { Profile } from "./Profile";
import { getUserByUsername } from "@/server/user";
import { notFound } from "next/navigation";
import { getRecsByUserId } from "@/server/rec";

export default async function UserProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const { username } = params;
  const user = await getUserByUsername(username).then((user) => {
    if (!user) {
      // redirect to 404 page
      notFound();
    }
    return user;
  });
  const recs = await getRecsByUserId(user.seed);

  return (
    <div
      className={cn(
        "w-full",
        "lg:w-[50%]",
        `min-h-[90svh]`,
        "flex",
        "flex-col",
        "p-8",
        "gap-y-6"
      )}
    >
      <Profile username={username} />
      <div className="w-full h-[1px] bg-gray-8" />
      {/* TODO: render user old recs */}
      {recs.map((rec) => {
        return <div key={rec.title}>{rec.title}</div>;
      })}
    </div>
  );
}

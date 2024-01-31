import { getUserByUsername } from "@/server/user";
import { cn } from "@/utils/cn";
import { notFound } from "next/navigation";
import { Profile } from "./Profile";

export default async function UserProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const { username } = params;
  const user = await getUserByUsername(username).catch((e) => {
    console.error(e);
    // redirect to 404
    notFound();
  });

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
      <Profile user={user} />
      <div className="w-full h-[1px] bg-gray-8" />
      {/* TODO: render user old recs */}
    </div>
  );
}

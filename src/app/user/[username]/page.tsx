import { cn } from "@/utils/cn";
import { Profile } from "./Profile";

export default async function UserProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const { username } = params;

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
    </div>
  );
}

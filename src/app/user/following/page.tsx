import { getUsersByIds } from "@/server/user";
import { getUserServerSide } from "@/utils/getUserServerSide";
import { cn } from "@/utils/cn";
import { Grid } from "@radix-ui/themes";
import { NotFoundBlock } from "@/app/search/NotFound";
import { UserCard } from "@/components/UserCard";
import { GoBackButton } from "@/components/GoBackButton";

export default async function FollowingPage() {
  const user = await getUserServerSide();
  const results = !user ? [] : await getUsersByIds(user.following);
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
      {results.length === 0 ? (
        <NotFoundBlock message="You did not follow any user right now. Search researchers you know and follow them!" />
      ) : (
        <Grid
          columns={{
            initial: "1",
            md: "2",
            lg: "3",
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

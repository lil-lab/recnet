import { Grid } from "@radix-ui/themes";

import { NotFoundBlock } from "@recnet/recnet-web/app/search/NotFound";
import { GoBackButton } from "@recnet/recnet-web/components/GoBackButton";
import { UserCard } from "@recnet/recnet-web/components/UserCard";
import { cn } from "@recnet/recnet-web/utils/cn";
import {
  withServerSideAuth,
  WithServerSideAuthProps,
} from "@recnet/recnet-web/utils/withServerSideAuth";

async function FollowingPage(props: WithServerSideAuthProps) {
  const { user } = props;

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
      {user.following.length === 0 ? (
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
          {user.following.map((userPreview, idx) => (
            <UserCard key={`${userPreview.id}-${idx}`} user={userPreview} />
          ))}
        </Grid>
      )}
    </div>
  );
}

export default async function Page() {
  const PageComponent = await withServerSideAuth(FollowingPage);
  return <PageComponent />;
}

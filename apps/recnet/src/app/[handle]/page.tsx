import { Text } from "@radix-ui/themes";
import { notFound } from "next/navigation";

import { serverClient } from "@recnet/recnet-web/app/_trpc/serverClient";
import { RecCard } from "@recnet/recnet-web/components/RecCard";
import { cn } from "@recnet/recnet-web/utils/cn";

import { Profile } from "./Profile";

export default async function UserProfilePage({
  params,
}: {
  params: { handle: string };
}) {
  const { handle } = params;
  const { user } = await serverClient.getUserByHandle({
    handle,
  });
  if (!user) {
    notFound();
  }
  const { recs } = await serverClient.getHistoricalRecs({ userId: user.id });

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
      <Profile handle={handle} />
      {recs.length > 0 ? (
        recs.map((rec, idx) => {
          return <RecCard key={`${rec.id}-${idx}`} recs={[rec]} showDate />;
        })
      ) : (
        <div className="h-[150px] w-full flex justify-center items-center">
          <Text size="3" className="text-gray-10">
            No recommendations yet.
          </Text>
        </div>
      )}
    </div>
  );
}

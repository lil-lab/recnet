import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { serverClient } from "@recnet/recnet-web/app/_trpc/serverClient";
import { cn } from "@recnet/recnet-web/utils/cn";

import { HistoricalRecs } from "./HistoricalRecs";
import { Profile } from "./Profile";

export async function generateMetadata({
  params,
}: {
  params: { handle: string };
}): Promise<Metadata> {
  const handle = params.handle;
  const { user } = await serverClient.getUserByHandle({
    handle,
  });

  return {
    title: `${user?.handle} on RecNet`,
    description: `${user?.bio}`,
  };
}

export default async function UserProfilePage({
  params,
}: {
  params: { handle: string };
}) {
  const { handle } = params;
  /*
    Check if deactivated user access their profile
  */
  const { user: me } = await serverClient.getMe();
  if (me?.handle === handle && me?.isActivated === false) {
    redirect("/reactivate");
  }

  const { user } = await serverClient.getUserByHandle({
    handle,
  });
  if (!user) {
    notFound();
  }

  return (
    <div
      className={cn(
        "w-full",
        "lg:w-[50%]",
        `min-h-[90svh]`,
        "flex",
        "flex-col",
        "p-8"
      )}
    >
      <Profile handle={handle} />
      <HistoricalRecs userId={user.id} />
    </div>
  );
}

import { redirect } from "next/navigation";
import React from "react";

import { LeftPanel } from "@recnet/recnet-web/app/feeds/LeftPanel";
import { cn } from "@recnet/recnet-web/utils/cn";
import { getUserServerSide } from "@recnet/recnet-web/utils/getUserServerSide";
import { AnnouncementCard } from "@recnet/recnet-web/components/AnnouncementCard";

export default async function FeedPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUserServerSide({
    notRegisteredCallback: () => {
      redirect("/onboard");
    },
  });
  if (!user) {
    redirect("/");
  }
  return (
    <div
      className={cn(
        "flex",
        "flex-col",
        "md:flex-row",
        "w-full",
        "h-full",
        `min-h-[90svh]`
      )}
    >
      <LeftPanel />
      <div className="w-full items-center flex flex-col">
        <AnnouncementCard
          className="w-[80%] md:w-[65%] mt-8"
          announcementKey="email-temp-not-working"
        >
          Email digests are temporarily offline while we complete our backend
          migration. We expect to re-activate them by April 21.
        </AnnouncementCard>
        {children}
      </div>
    </div>
  );
}

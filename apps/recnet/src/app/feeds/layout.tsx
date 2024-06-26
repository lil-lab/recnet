import { redirect } from "next/navigation";
import React from "react";

import { LeftPanel } from "@recnet/recnet-web/app/feeds/LeftPanel";
import { cn } from "@recnet/recnet-web/utils/cn";
import { getUserServerSide } from "@recnet/recnet-web/utils/getUserServerSide";

import { LatestAnnouncement } from "./LatestAnnouncement";

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
        <div className={cn("w-[80%]", "md:w-[65%]", "flex", "mx-auto", "pt-6")}>
          <LatestAnnouncement />
        </div>
        {children}
      </div>
    </div>
  );
}

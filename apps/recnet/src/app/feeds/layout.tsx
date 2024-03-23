import { redirect } from "next/navigation";
import React from "react";

import { LeftPanel } from "@recnet/recnet-web/app/feeds/LeftPanel";
import { cn } from "@recnet/recnet-web/utils/cn";
import { getUserServerSide } from "@recnet/recnet-web/utils/getUserServerSide";

export default async function FeedPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUserServerSide();
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
      {children}
    </div>
  );
}

import React from "react";

import { LeftPanel } from "@recnet/recnet-web/app/feeds/LeftPanel";
import {
  WithServerSideAuthProps,
  withServerSideAuth,
} from "@recnet/recnet-web/components/hoc/withServerSideAuth";
import { cn } from "@recnet/recnet-web/utils/cn";

import { LatestAnnouncement } from "./LatestAnnouncement";

async function FeedPageLayout(
  props: WithServerSideAuthProps<{
    children: React.ReactNode;
  }>
) {
  const { children } = props;
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

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const LayoutComponent = await withServerSideAuth(FeedPageLayout);
  return <LayoutComponent>{children}</LayoutComponent>;
}

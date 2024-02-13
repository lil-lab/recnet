import { cn } from "@/utils/cn";
import React from "react";
import { LeftPanel } from "@/app/feeds/LeftPanel";

export default async function FeedPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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

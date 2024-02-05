import { cn } from "@/utils/cn";
import { Text } from "@radix-ui/themes";
import React from "react";
import { LeftPanel } from "@/app/feeds/LeftPanel";

export default async function FeedPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={cn("flex", "flex-row", "w-full", "h-full", `min-h-[90svh]`)}
    >
      <LeftPanel />
      {children}
    </div>
  );
}

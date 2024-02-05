import { cn } from "@/utils/cn";
import { Text } from "@radix-ui/themes";
import React from "react";

export default async function FeedPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={cn("flex", "flex-row", "w-full", "h-full", `min-h-[90svh]`)}
    >
      <div
        className={cn(
          "w-[17%]",
          `min-h-[90svh]`,
          "border-r-[1px]",
          "border-gray-6",
          "flex",
          "flex-col",
          "p-4",
          "gap-y-3"
        )}
      >
        <Text size="3" className="text-gray-10">
          Left bar: under construction 🚧
        </Text>
      </div>
      {children}
    </div>
  );
}

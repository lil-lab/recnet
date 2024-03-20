"use client";

import { Cross1Icon } from "@radix-ui/react-icons";
import { Text } from "@radix-ui/themes";
import { useState } from "react";

import { cn } from "@recnet/recnet-web/utils/cn";

export function AnnouncementBanner() {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div
      className={cn(
        "fixed",
        "top-[64px]",
        "left-0",
        "w-full",
        "bg-gradient-to-b",
        "from-[#0091FF]",
        "to-[#0091FF50]",
        "py-3",
        "flex",
        "flex-row",
        "justify-between",
        "items-center",
        "text-white",
        {
          hidden: !isOpen,
        }
      )}
    >
      <div />
      <Text size="2" weight="medium">
        📢 RecNet is under early development. Signing up requires an invite
        code.
      </Text>
      <div
        className="mr-4 cursor-pointer"
        onClick={() => {
          setIsOpen(false);
        }}
      >
        <Cross1Icon width="20" height="20" />
      </div>
    </div>
  );
}

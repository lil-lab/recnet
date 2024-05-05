"use client";

import { Popover, Flex, Text } from "@radix-ui/themes";
import { useState } from "react";

import { InviteCodeTableView } from "@recnet/recnet-web/components/InviteCodeTable";
import { cn } from "@recnet/recnet-web/utils/cn";

export function InviteCodePopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [inviteCodeTableView, setInviteCodeTableView] =
    useState<InviteCodeTableView>("all");

  return (
    <div className="w-full flex flex-col">
      <Popover.Root
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
        }}
      >
        <Popover.Trigger>
          <Flex className="w-full justify-start items-center text-gray-11 cursor-pointer hover:bg-gray-3 hover:text-gray-12 transition-all ease-in-out rounded-2 p-2 select-none">
            <Text size="1" weight={"medium"}>
              View invite codes
            </Text>
            <Text
              size="1"
              className={cn(
                "ml-1",
                "p-1",
                "w-auto",
                "w-[18px]",
                "h-[18px]",
                "flex",
                "justify-center",
                "items-center",
                "bg-blue-6",
                "rounded-[999px]"
              )}
            >
              5
            </Text>
          </Flex>
        </Popover.Trigger>
        <Popover.Content
          className="overflow-hidden"
          side="right"
          alignOffset={-5}
        >
          content
        </Popover.Content>
      </Popover.Root>
    </div>
  );
}

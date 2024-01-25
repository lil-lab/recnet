"use client";

import { cn } from "@/utils/cn";
import { Button, Flex, Text, TextField } from "@radix-ui/themes";
import Link from "next/link";

export function Headerbar() {
  return (
    <div
      className={cn(
        "flex",
        "w-full",
        "h-[64px]",
        "justify-between",
        "px-16",
        "py-[10px]",
        "shadow-4",
        "bg-white"
      )}
    >
      <Flex className="items-center" gap="4">
        <Text className={cn("text-blue-10", "font-bold")} size="8">
          RecNet
        </Text>
        <TextField.Root>
          <TextField.Input placeholder="Search the users..." size="2" />
        </TextField.Root>
      </Flex>
      <Flex className="items-center" gap="4">
        <Link href="/about">
          <Text size="3" weight="medium">
            About
          </Text>
        </Link>
        <Link href="/faq">
          <Text size="3" weight="medium">
            FAQ
          </Text>
        </Link>
        <Button>Log In</Button>
      </Flex>
    </div>
  );
}

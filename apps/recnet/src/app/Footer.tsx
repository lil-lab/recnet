"use client";

import {
  GearIcon,
  GitHubLogoIcon,
  MoonIcon,
  SunIcon,
} from "@radix-ui/react-icons";
import { Text, Flex, DropdownMenu, Button } from "@radix-ui/themes";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

import { cn } from "@recnet/recnet-web/utils/cn";

import { trpc } from "./_trpc/client";

function Footer() {
  const { data, isPending } = trpc.apiHealthCheck.useQuery();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={cn(
        "w-full",
        "border-0",
        "md:border-t-[1px]",
        "border-slate-6",
        "flex",
        "justify-between",
        "px-6",
        "items-center",
        "flex-col",
        "sm:flex-row",
        "text-gray-8",
        "h-fit gap-y-1",
        "sm:h-[44px]",
        "mb-4 sm:mb-0"
      )}
    >
      <Flex gap="2" className="items-center">
        <div
          className={cn("rounded-[999px]", "w-2", "h-2", {
            "bg-gray-8": isPending,
            "bg-green-8": data?.ok && !isPending,
            "bg-red-8": !data?.ok && !isPending,
          })}
        />
        <Text size="1">
          {isPending
            ? "Checking API service..."
            : data?.ok
              ? "All systems normal"
              : "API service is down"}
        </Text>
      </Flex>
      <Text size="1">© 2024 RecNet. All rights reserved.</Text>
      <Flex gap="2" className="items-center">
        {theme && mounted ? (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger className="cursor-pointer">
              <Button size="1" variant="soft">
                <Flex gap={"2"} className="text-gray-10 items-center">
                  {theme === "system" ? (
                    <GearIcon width="18" height="18" />
                  ) : theme === "dark" ? (
                    <MoonIcon width="18" height="18" />
                  ) : (
                    <SunIcon width="18" height="18" />
                  )}
                  {theme.charAt(0).toUpperCase() + theme.slice(1)}
                </Flex>
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content
              sideOffset={5}
              alignOffset={5}
              className="text-gray-10"
              onCloseAutoFocus={(e) => {
                e.preventDefault();
              }}
            >
              <DropdownMenu.Item
                className="cursor-pointer"
                onClick={() => {
                  setTheme("dark");
                }}
              >
                <Flex gap={"2"} className="items-center">
                  <MoonIcon width="18" height="18" />
                  Dark
                </Flex>
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="cursor-pointer"
                onClick={() => {
                  setTheme("light");
                }}
              >
                <Flex gap={"2"} className="items-center">
                  <SunIcon width="18" height="18" />
                  Light
                </Flex>
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="cursor-pointer"
                onClick={() => {
                  setTheme("system");
                }}
              >
                <Flex gap={"2"} className="items-center">
                  <GearIcon width="18" height="18" />
                  System
                </Flex>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        ) : null}
        <Link
          href="https://github.com/lil-lab/recnet"
          target="_blank"
          className="mx-1"
        >
          <GitHubLogoIcon
            width="20"
            height="20"
            className={cn(
              "hover:scale-[105%]",
              "transition-transform",
              "cursor-pointer",
              "ease-in-out"
            )}
          />
        </Link>
      </Flex>
    </div>
  );
}

export { Footer };

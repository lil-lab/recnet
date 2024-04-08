"use client";

import { GitHubLogoIcon, MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { Text, Flex } from "@radix-ui/themes";
import Link from "next/link";
import { useTheme } from "next-themes";

import { cn } from "@recnet/recnet-web/utils/cn";

import { trpc } from "./_trpc/client";

function Footer() {
  const { data, isPending } = trpc.apiHealthCheck.useQuery();
  const { theme, setTheme } = useTheme();

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
        "h-fit mb-4 gap-y-1",
        "sm:h-[44px]"
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
        <button
          onClick={() => {
            setTheme("dark");
          }}
          className={cn(
            "hover:scale-[105%]",
            "transition-transform",
            "cursor-pointer",
            "ease-in-out",
            "p-1 rounded-[999px]",
            {
              "bg-gray-4 bg-opacity-5": theme === "dark",
            }
          )}
        >
          <MoonIcon width="20" height="20" />
        </button>
        <button
          onClick={() => {
            setTheme("light");
          }}
          className={cn(
            "hover:scale-[105%]",
            "transition-transform",
            "cursor-pointer",
            "ease-in-out",
            "p-1 rounded-[999px]",
            {
              "bg-gray-3 bg-opacity-5": theme === "light",
            }
          )}
        >
          <SunIcon width="20" height="20" />
        </button>
      </Flex>
    </div>
  );
}

export { Footer };

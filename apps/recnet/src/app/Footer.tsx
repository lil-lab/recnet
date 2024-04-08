"use client";

import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Text, Flex } from "@radix-ui/themes";
import Link from "next/link";

import { cn } from "@recnet/recnet-web/utils/cn";

import { trpc } from "./_trpc/client";

function Footer() {
  const { data, isPending } = trpc.apiHealthCheck.useQuery();

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
        "h-fit my-1 gap-y-1",
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
      <Flex gap="2" className="items-center hidden sm:flex">
        <Link href="https://github.com/lil-lab/recnet" target="_blank">
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

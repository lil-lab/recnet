"use client";
import { Flex, Text } from "@radix-ui/themes";
import Link from "next/link";

import { cn } from "../utils/cn";

export interface LinkPreviewProps {
  url: string;
  title: string;
  description: string;
  imageUrl: string;
}

export function LinkPreview(props: LinkPreviewProps) {
  const { url, title, description, imageUrl } = props;

  const domain = url.replace("https://", "").split("/")[0];

  return (
    <Link href={url} target="_blank" className={cn("group", "cursor-pointer")}>
      <div
        className={cn(
          "flex flex-col md:flex-row items-center my-4",
          "rounded-4",
          "border-[1px] border-gray-6",
          "text-gray-11",
          "group-hover:bg-gray-2",
          "transition-all duration-200 ease-in-out"
        )}
      >
        <div className="w-full md:w-fit h-full flex items-center justify-center">
          {/* eslint-disable-next-line */}
          <img
            src={imageUrl}
            alt={title}
            className={cn(
              "object-contain",
              "p-4",
              "group-hover:scale-105",
              "transition-all duration-200 ease-in-out",
              "min-w-[120px] max-w-[150px]"
            )}
          />
        </div>

        <Flex
          className={cn(
            "flex flex-col p-3 justify-between h-full w-full",
            "gap-y-2",
            "border-l-[1px] border-gray-6",
            "pr-8"
          )}
        >
          <Text size="4" weight={"medium"} className="text-gray-12">
            {title}
          </Text>
          <Text size="2">{description}</Text>
          <Text size="1">{domain}</Text>
        </Flex>
      </div>
    </Link>
  );
}

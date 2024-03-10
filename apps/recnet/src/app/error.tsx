"use client";

import { cn } from "@recnet/recnet-web/utils/cn";
import { Flex, Text } from "@radix-ui/themes";
import { RecNetLink } from "@recnet/recnet-web/components/Link";
import { ReportEmailAccount } from "./not-found";

export default function NotFoundPage() {
  return (
    <div
      className={cn(
        "w-full",
        "lg:w-[60%]",
        `min-h-[90svh]`,
        "flex",
        "flex-col",
        "p-8",
        "gap-y-6",
        "justify-center",
        "items-center"
      )}
    >
      <Flex className="items-center gap-x-8">
        <Text className="text-gray-10 text-[72px]" weight="medium">
          500
        </Text>
        <div className="w-[2px] bg-gray-10 h-[75%]" />
        <div className="flex flex-col gap-y-1">
          <Text className="text-gray-11 text-[24px]" weight="medium">
            Application error
          </Text>
          <Text className="text-gray-10 text-[16px]">
            Unexpected error occurred. Please help us by reporting this issue.
          </Text>
          <Flex className="items-center text-gray-10 text-[16px] flex-wrap">
            <RecNetLink href={`mailto:${ReportEmailAccount}`}>
              <Text className="text-blue-9 text-[16px]">
                Report issue via email
              </Text>
            </RecNetLink>
            <Text className="mx-2"> or </Text>
            <RecNetLink href="/">
              <Text className="text-blue-9 text-[16px]">
                {" "}
                open an issue at Github
              </Text>
            </RecNetLink>
            <Text>.</Text>
          </Flex>
        </div>
      </Flex>
    </div>
  );
}

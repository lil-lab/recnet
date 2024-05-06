"use client";

import { Popover, Flex, Text } from "@radix-ui/themes";
import { InfiniteData } from "@tanstack/react-query";
import { useState, useMemo } from "react";

import { trpc } from "@recnet/recnet-web/app/_trpc/client";
import { InviteCodeTableView } from "@recnet/recnet-web/components/InviteCodeTable";
import { InviteCodeTable } from "@recnet/recnet-web/components/InviteCodeTable";
import { cn } from "@recnet/recnet-web/utils/cn";

import {
  GetInviteCodesAllResponse,
  InviteCode,
} from "@recnet/recnet-api-model";

const INIVITE_CODE_PAGE_SIZE = 30;

// TODO: refactor after finishing query API
const getInviteCodesFromInfiniteQuery = (
  infiniteQueryData: InfiniteData<GetInviteCodesAllResponse> | undefined
) => {
  if (!infiniteQueryData) {
    return [];
  }
  return (infiniteQueryData?.pages ?? []).reduce((acc, page) => {
    return [...acc, ...page.inviteCodes];
  }, [] as InviteCode[]);
};

export function InviteCodePopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [inviteCodeTableView, setInviteCodeTableView] =
    useState<InviteCodeTableView>("not-used");

  // TODO: refactor after finishing query API
  const { data, isPending, hasNextPage, fetchNextPage, isFetching } =
    trpc.getAllInviteCodes.useInfiniteQuery(
      {
        pageSize: INIVITE_CODE_PAGE_SIZE,
        used:
          inviteCodeTableView === "used"
            ? true
            : inviteCodeTableView === "not-used"
              ? false
              : undefined,
      },
      {
        initialCursor: 1,
        getNextPageParam: (lastPage, allPages) => {
          if (!lastPage.hasNext) {
            return null;
          }
          return allPages.length + 1;
        },
      }
    );
  const inviteCodes = useMemo(
    () => getInviteCodesFromInfiniteQuery(data),
    [data]
  );

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
          alignOffset={-50}
          maxWidth={"600"}
          maxHeight={"500"}
        >
          <InviteCodeTable
            inviteCodes={inviteCodes}
            hasNextPage={hasNextPage}
            fetchNextPage={async () => {
              fetchNextPage();
            }}
            isPending={isPending}
            isFetchingNextPage={isFetching}
            view={inviteCodeTableView}
            onViewChange={setInviteCodeTableView}
            tableProps={{
              className: "h-[60svh]",
            }}
            tableHeaderProps={{
              className: "dark:bg-slate-2",
            }}
            excludeColumns={["Referrer"]}
          />
        </Popover.Content>
      </Popover.Root>
    </div>
  );
}

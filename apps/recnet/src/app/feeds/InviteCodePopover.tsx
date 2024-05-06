"use client";

import { Popover, Flex, Text } from "@radix-ui/themes";
import { InfiniteData } from "@tanstack/react-query";
import { useState, useMemo } from "react";

import { trpc } from "@recnet/recnet-web/app/_trpc/client";
import { InviteCodeTableView } from "@recnet/recnet-web/components/InviteCodeTable";
import { InviteCodeTable } from "@recnet/recnet-web/components/InviteCodeTable";
import { cn } from "@recnet/recnet-web/utils/cn";

import { GetInviteCodesResponse, InviteCode } from "@recnet/recnet-api-model";

const INIVITE_CODE_PAGE_SIZE = 20;

const getInviteCodesFromInfiniteQuery = (
  infiniteQueryData: InfiniteData<GetInviteCodesResponse> | undefined
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

  const { data, isPending, hasNextPage, fetchNextPage, isFetching } =
    trpc.getInviteCodes.useInfiniteQuery(
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
  const unusedCodesCount = data?.pages?.[0]?.unusedCodesCount ?? 0;

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
            {isPending ? null : (
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
                  "rounded-[999px]",
                  "text-[11px]"
                )}
              >
                {unusedCodesCount}
              </Text>
            )}
          </Flex>
        </Popover.Trigger>
        <Popover.Content
          className="overflow-hidden min-w-[450px]"
          side="right"
          alignOffset={-50}
          width={"450"}
          maxHeight={"400"}
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

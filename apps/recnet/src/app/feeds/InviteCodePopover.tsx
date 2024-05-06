"use client";

import { Popover } from "@radix-ui/themes";
import { InfiniteData } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";

import { trpc } from "@recnet/recnet-web/app/_trpc/client";
import { InviteCodeTableView } from "@recnet/recnet-web/components/InviteCodeTable";
import { InviteCodeTable } from "@recnet/recnet-web/components/InviteCodeTable";

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

interface InviteCodePopoverProps {
  renderTrigger: (unusedCodesCount: number | undefined) => JSX.Element;
}

export function InviteCodePopover(props: InviteCodePopoverProps) {
  const { renderTrigger } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [inviteCodeTableView, setInviteCodeTableView] =
    useState<InviteCodeTableView>("not-used");
  const [unusedCodesCount, setUnusedCodesCount] = useState<number | undefined>(
    undefined
  );

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

  useEffect(() => {
    if (data?.pages?.[0]?.unusedCodesCount) {
      setUnusedCodesCount(data.pages[0].unusedCodesCount);
    }
  }, [data]);

  return (
    <div className="w-full flex flex-col">
      <Popover.Root
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
        }}
      >
        <Popover.Trigger>{renderTrigger(unusedCodesCount)}</Popover.Trigger>
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

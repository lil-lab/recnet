"use client";

import { InfiniteData } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { trpc } from "@recnet/recnet-web/app/_trpc/client";
import { AdminSectionTitle } from "@recnet/recnet-web/app/admin/AdminSections";
import { InviteCodeTable } from "@recnet/recnet-web/components/InviteCodeTable";
import { cn } from "@recnet/recnet-web/utils/cn";

import {
  GetInviteCodesAllResponse,
  InviteCode,
} from "@recnet/recnet-api-model";

const INIVITE_CODE_PAGE_SIZE = 30;

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

export default function InviteCodeMonitorPage({
  searchParams,
}: {
  searchParams: {
    used?: string;
  };
}) {
  const router = useRouter();
  const { used } = searchParams;
  const { data, isPending, hasNextPage, fetchNextPage, isFetching } =
    trpc.getAllInviteCodes.useInfiniteQuery(
      {
        pageSize: INIVITE_CODE_PAGE_SIZE,
        used: used === "true" ? true : used === "false" ? false : undefined,
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
    <div className={cn("w-full", "md:w-[85%]", "flex", "flex-col", "gap-y-4")}>
      <div className="flex flex-col gap-y-2 w-full">
        <AdminSectionTitle description="View who used the invite codes. Sorted in reverse-chronological order.">
          Invite Code Monitor
        </AdminSectionTitle>
        <InviteCodeTable
          inviteCodes={inviteCodes}
          hasNextPage={hasNextPage}
          fetchNextPage={async () => {
            fetchNextPage();
          }}
          isPending={isPending}
          isFetchingNextPage={isFetching}
          view={
            used === "true" ? "used" : used === "false" ? "not-used" : "all"
          }
          onViewChange={(view) => {
            if (view === "all") {
              router.replace("/admin/invite-code/monitor");
              return;
            }
            router.replace(
              `/admin/invite-code/monitor?used=${view === "used"}`
            );
          }}
          tableProps={{
            className: "max-h-[60svh]",
          }}
        />
      </div>
    </div>
  );
}

"use client";

import { Flex, Table, Text, SegmentedControl } from "@radix-ui/themes";
import { InfiniteData } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";

import { trpc } from "@recnet/recnet-web/app/_trpc/client";
import {
  AdminSectionBox,
  AdminSectionTitle,
} from "@recnet/recnet-web/app/admin/AdminSections";
import { Avatar } from "@recnet/recnet-web/components/Avatar";
import { CopiableInviteCode } from "@recnet/recnet-web/components/InviteCode";
import { RecNetLink } from "@recnet/recnet-web/components/Link";
import { LoadingBox } from "@recnet/recnet-web/components/LoadingBox";
import { cn } from "@recnet/recnet-web/utils/cn";

import { formatDate } from "@recnet/recnet-date-fns";

import {
  GetInviteCodesResponse,
  InviteCode,
  UserPreview,
} from "@recnet/recnet-api-model";

const INIVITE_CODE_PAGE_SIZE = 30;

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

const TableUserCard = (props: { user: UserPreview }) => {
  const { user } = props;
  return (
    <RecNetLink href={`/${user.handle}`}>
      <Flex gap="2" className="items-center gap-x-2">
        <Avatar user={user} className={cn("w-[40px]", "h-[40px]")} />
        <Text className="whitespace-nowrap">{user.displayName}</Text>
      </Flex>
    </RecNetLink>
  );
};

const TableLoader = () => {
  return <LoadingBox className="h-[300px]" />;
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

  const { ref: tableBottomRef, inView: tableBottomInView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    if (tableBottomInView && hasNextPage) {
      fetchNextPage();
    }
  }, [tableBottomInView, hasNextPage, fetchNextPage]);

  return (
    <div className={cn("w-full", "md:w-[85%]", "flex", "flex-col", "gap-y-4")}>
      <div className="flex flex-col gap-y-2 w-full">
        <AdminSectionTitle description="View who used the invite codes. Sorted in reverse-chronological order.">
          Invite Code Monitor
        </AdminSectionTitle>
        <div className="flex w-full justify-end items-center">
          <SegmentedControl.Root
            defaultValue={
              used === "true" ? "used" : used === "false" ? "not-used" : "all"
            }
            onValueChange={(v) => {
              if (v === "all") {
                router.replace("/admin/invite-code/monitor");
                return;
              }
              router.replace(`/admin/invite-code/monitor?used=${v === "used"}`);
            }}
          >
            <SegmentedControl.Item value={"all"}>All</SegmentedControl.Item>
            <SegmentedControl.Item value="used">Used</SegmentedControl.Item>
            <SegmentedControl.Item value="not-used">
              Unused
            </SegmentedControl.Item>
          </SegmentedControl.Root>
        </div>
        <AdminSectionBox>
          {!isPending ? (
            <Table.Root className="w-full max-h-[60svh] overflow-x-scroll relative table-fixed">
              <Table.Header className="sticky top-0 bg-white dark:bg-slate-1 z-[500]">
                <Table.Row>
                  <Table.ColumnHeaderCell className="w-[400px]">
                    Code
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Used</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Used By</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Referrer</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {inviteCodes.map((inviteCode) => (
                  <Table.Row
                    className="align-middle"
                    key={inviteCode.code + used}
                  >
                    <Table.RowHeaderCell>
                      <CopiableInviteCode inviteCode={inviteCode.code} />
                    </Table.RowHeaderCell>
                    <Table.Cell>
                      {inviteCode.usedAt
                        ? formatDate(new Date(inviteCode.usedAt))
                        : "-"}
                    </Table.Cell>
                    <Table.Cell>
                      {inviteCode.usedBy ? (
                        <TableUserCard user={inviteCode.usedBy} />
                      ) : (
                        "-"
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <TableUserCard user={inviteCode.owner} />
                    </Table.Cell>
                  </Table.Row>
                ))}
                <Table.Row>
                  <Table.Cell colSpan={4} ref={tableBottomRef}>
                    {isFetching ? (
                      <LoadingBox className="h-[200px]" />
                    ) : (
                      <div className="w-full h-[1px]" />
                    )}
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table.Root>
          ) : (
            <TableLoader />
          )}
        </AdminSectionBox>
      </div>
    </div>
  );
}

"use client";

import { Flex, Table, Text, SegmentedControl } from "@radix-ui/themes";
import { FetchNextPageOptions } from "@tanstack/react-query";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { z } from "zod";

import { Avatar } from "@recnet/recnet-web/components/Avatar";
import { CopiableInviteCode } from "@recnet/recnet-web/components/InviteCode";
import { RecNetLink } from "@recnet/recnet-web/components/Link";
import { LoadingBox } from "@recnet/recnet-web/components/LoadingBox";

import { formatDate } from "@recnet/recnet-date-fns";

import { InviteCode, UserPreview } from "@recnet/recnet-api-model";

import { cn } from "../utils/cn";

const inviteCodeTableViewEnum = z.enum(["all", "not-used", "used"]);
export type InviteCodeTableView = z.infer<typeof inviteCodeTableViewEnum>;

const Columns = ["Code", "Used", "Used By", "Referrer"] as const;
type Column = (typeof Columns)[number];

export interface InviteCodeTableProps {
  inviteCodes: InviteCode[];
  hasNextPage: boolean;
  fetchNextPage: (options?: FetchNextPageOptions | undefined) => Promise<void>;
  view: InviteCodeTableView;
  onViewChange: (view: InviteCodeTableView) => void;
  isPending: boolean;
  isFetchingNextPage: boolean;
  tableProps?: React.ComponentProps<typeof Table.Root>;
  tableHeaderProps?: React.ComponentProps<typeof Table.Header>;
  excludeColumns?: Exclude<Column, "Code">[];
}

export function InviteCodeTable(props: InviteCodeTableProps) {
  const {
    inviteCodes,
    hasNextPage,
    fetchNextPage,
    view,
    onViewChange,
    isPending,
    isFetchingNextPage,
    tableProps,
    tableHeaderProps,
    excludeColumns = [],
  } = props;
  const { className: tableClassName, ...restTableProps } = tableProps ?? {};
  const { className: tableHeaderClassName, ...restTableHeaderProps } =
    tableHeaderProps ?? {};

  const { ref: tableBottomRef, inView: tableBottomInView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    if (tableBottomInView && hasNextPage) {
      fetchNextPage();
    }
  }, [tableBottomInView, hasNextPage, fetchNextPage]);

  return (
    <div className={cn("flex", "flex-col", "gap-y-4", "max-w-[90vw]")}>
      <div className="flex w-full justify-end items-center">
        <SegmentedControl.Root
          defaultValue={view}
          value={view}
          onValueChange={(v) => {
            const res = inviteCodeTableViewEnum.safeParse(v);
            if (!res.success) {
              throw new Error(
                "Invalid view. View must be one of 'all', 'not-used', 'used'"
              );
            }
            onViewChange(res.data);
          }}
        >
          <SegmentedControl.Item value="all">All</SegmentedControl.Item>
          <SegmentedControl.Item value="used">Used</SegmentedControl.Item>
          <SegmentedControl.Item value="not-used">Unused</SegmentedControl.Item>
        </SegmentedControl.Root>
      </div>
      <div
        className={cn(
          "flex",
          "w-full",
          "p-4",
          "border-[1px]",
          "rounded-4",
          "border-gray-6",
          "mb-4"
        )}
      >
        {!isPending ? (
          <Table.Root
            className={cn(
              "w-full overflow-x-scroll relative table-fixed",
              tableClassName
            )}
            {...restTableProps}
          >
            <Table.Header
              className={cn(
                "sticky top-0 bg-white dark:bg-slate-1 z-[500]",
                tableHeaderClassName
              )}
              {...restTableHeaderProps}
            >
              <Table.Row>
                {Columns.map((column) => {
                  if (column !== "Code" && excludeColumns.includes(column)) {
                    return null;
                  }
                  return (
                    <Table.ColumnHeaderCell
                      key={column}
                      className={cn({
                        "w-[400px]": column === "Code",
                      })}
                    >
                      {column}
                    </Table.ColumnHeaderCell>
                  );
                })}
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {inviteCodes.map((inviteCode, idx) => (
                <Table.Row
                  className="align-middle"
                  key={`${inviteCode.code}-${idx}-${view}`}
                >
                  <Table.RowHeaderCell>
                    <CopiableInviteCode inviteCode={inviteCode.code} />
                  </Table.RowHeaderCell>
                  {excludeColumns.includes("Used") ? null : (
                    <Table.Cell>
                      {inviteCode.usedAt
                        ? formatDate(new Date(inviteCode.usedAt))
                        : "-"}
                    </Table.Cell>
                  )}
                  {excludeColumns.includes("Used By") ? null : (
                    <Table.Cell>
                      {inviteCode.usedBy ? (
                        <TableUserCard user={inviteCode.usedBy} />
                      ) : (
                        "-"
                      )}
                    </Table.Cell>
                  )}
                  {excludeColumns.includes("Referrer") ? null : (
                    <Table.Cell>
                      <TableUserCard user={inviteCode.owner} />
                    </Table.Cell>
                  )}
                </Table.Row>
              ))}
              <Table.Row>
                <Table.Cell colSpan={4} ref={tableBottomRef}>
                  {isFetchingNextPage ? (
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
      </div>
    </div>
  );
}

const TableLoader = () => {
  return <LoadingBox className="h-[300px]" />;
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

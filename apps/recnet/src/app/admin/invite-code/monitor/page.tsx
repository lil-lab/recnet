"use client";

import { Flex, Table, Text } from "@radix-ui/themes";
import { TailSpin } from "react-loader-spinner";

import { trpc } from "@recnet/recnet-web/app/_trpc/client";
import {
  AdminSectionBox,
  AdminSectionTitle,
} from "@recnet/recnet-web/app/admin/AdminSections";
import { Avatar } from "@recnet/recnet-web/components/Avatar";
import { CopiableInviteCode } from "@recnet/recnet-web/components/InviteCode";
import { RecNetLink } from "@recnet/recnet-web/components/Link";
import { cn } from "@recnet/recnet-web/utils/cn";

import { UserPreview } from "@recnet/recnet-api-model";

import { formatDate } from "@recnet/recnet-date-fns";

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
  return (
    <Flex className="justify-center items-center w-full h-[300px]">
      <TailSpin
        radius={"3"}
        visible={true}
        height="40"
        width="40"
        color={"#909090"}
        ariaLabel="line-wave-loading"
        wrapperClass="w-fit h-fit"
      />
    </Flex>
  );
};

export default function InviteCodeMonitorPage() {
  const { data, isPending, isFetching } = trpc.getAllInviteCodes.useQuery();
  const inviteCodes = data?.inviteCodes ?? [];
  const isLoading = isPending || isFetching;

  return (
    <div className={cn("w-full", "md:w-[85%]", "flex", "flex-col", "gap-y-4")}>
      <div className="flex flex-col gap-y-2 w-full">
        <AdminSectionTitle description="View who used the invite codes. Sorted in reverse-chronological order.">
          Invite Code Monitor
        </AdminSectionTitle>
        <AdminSectionBox>
          {inviteCodes && !isLoading ? (
            <Table.Root className="w-full max-h-[60svh] relative table-fixed">
              <Table.Header className="sticky top-0 bg-white z-[500]">
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
                {inviteCodes
                  .filter((c) => c.usedBy)
                  .map((inviteCode) => (
                    <Table.Row className="align-middle" key={inviteCode.code}>
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
              </Table.Body>
            </Table.Root>
          ) : (
            <TableLoader />
          )}
        </AdminSectionBox>
        <AdminSectionTitle>Unused Invite Codes</AdminSectionTitle>
        <AdminSectionBox>
          {inviteCodes && !isLoading ? (
            <Table.Root className="w-full max-h-[60svh] relative">
              <Table.Header className="sticky top-0 bg-white z-[500]">
                <Table.Row>
                  <Table.ColumnHeaderCell className="md:w-[30%]">
                    Code
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Owner</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {inviteCodes
                  .filter((c) => !c.usedBy)
                  .map((inviteCode) => (
                    <Table.Row className="align-middle" key={inviteCode.code}>
                      <Table.RowHeaderCell>
                        <CopiableInviteCode inviteCode={inviteCode.code} />
                      </Table.RowHeaderCell>
                      <Table.Cell>
                        <TableUserCard user={inviteCode.owner} />
                      </Table.Cell>
                    </Table.Row>
                  ))}
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

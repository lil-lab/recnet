"use client";

import { cn } from "@/utils/cn";
import { AdminSectionBox, AdminSectionTitle } from "@/app/admin/AdminSections";
import { useInviteCodes } from "@/hooks/useInviteCodes";
import { Flex, Table, Text } from "@radix-ui/themes";
import { InviteCode } from "@/types/inviteCode";
import { getDateFromFirebaseTimestamp, formatDate } from "@/utils/date";
import { Avatar } from "@/components/Avatar";
import { RecNetLink } from "@/components/Link";
import { TailSpin } from "react-loader-spinner";
import { User } from "@/types/user";
import { CopiableInviteCode } from "@/components/InviteCode";

const TableUserCard = (props: { user: User }) => {
  const { user } = props;
  return (
    <RecNetLink href={`/${user.username}`}>
      <Flex gap="2" className="items-center gap-x-2">
        <Avatar user={user} className={cn("w-[40px]", "h-[40px]")} />
        {user.displayName}
      </Flex>
    </RecNetLink>
  );
};

const InviteCodeTableRow = (props: { inviteCode: InviteCode }) => {
  const { inviteCode } = props;

  return (
    <Table.Row className="align-middle">
      <Table.RowHeaderCell>
        <CopiableInviteCode inviteCode={inviteCode.id} />
      </Table.RowHeaderCell>
      <Table.Cell>
        <Text
          className={cn({
            "text-green-9": inviteCode.used,
            "text-red-9": !inviteCode.used,
          })}
        >
          {inviteCode.used ? "Yes" : "No"}
        </Text>
      </Table.Cell>
      <Table.Cell>
        {inviteCode.usedAt
          ? formatDate(getDateFromFirebaseTimestamp(inviteCode.usedAt))
          : "-"}
      </Table.Cell>
      <Table.Cell>
        {inviteCode.usedBy ? <TableUserCard user={inviteCode.usedBy} /> : "-"}
      </Table.Cell>
      <Table.Cell>
        {inviteCode.issuedTo ? (
          <TableUserCard user={inviteCode.issuedTo} />
        ) : (
          "-"
        )}
      </Table.Cell>
    </Table.Row>
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
  const { inviteCodes, isLoading } = useInviteCodes();

  return (
    <div className={cn("w-full", "md:w-[85%]", "flex", "flex-col", "gap-y-4")}>
      <div className="flex flex-col gap-y-2 w-full">
        <AdminSectionTitle description="View who used the invite codes. Sorted in reverse-chronological order.">
          Invite Code Monitor
        </AdminSectionTitle>
        <AdminSectionBox>
          {inviteCodes && !isLoading ? (
            <Table.Root className="w-full max-h-[60svh] relative">
              <Table.Header className="sticky top-0 bg-white z-[1000]">
                <Table.Row>
                  <Table.ColumnHeaderCell className="w-[30%]">
                    Code
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Used</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Used At</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Used By</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Owner</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {inviteCodes
                  .filter((c) => c.used)
                  .map((inviteCode) => (
                    <InviteCodeTableRow
                      key={inviteCode.id}
                      inviteCode={inviteCode}
                    />
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
              <Table.Header className="sticky top-0 bg-white z-[1000]">
                <Table.Row>
                  <Table.ColumnHeaderCell className="w-[30%]">
                    Code
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Used</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Used At</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Used By</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Owner</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {inviteCodes
                  .filter((c) => !c.used)
                  .map((inviteCode) => (
                    <InviteCodeTableRow
                      key={inviteCode.id}
                      inviteCode={inviteCode}
                    />
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

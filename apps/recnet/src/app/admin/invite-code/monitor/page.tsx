"use client";

import { cn } from "@/utils/cn";
import { AdminSectionBox, AdminSectionTitle } from "@/app/admin/AdminSections";
import { useInviteCodes } from "@/hooks/useInviteCodes";
import { Table } from "@radix-ui/themes";
import { InviteCode } from "@/types/inviteCode";
import { getDateFromFirebaseTimestamp, formatDate } from "@/utils/date";

const InviteCodeTableRow = (props: { inviteCode: InviteCode }) => {
  const { inviteCode } = props;
  return (
    <Table.Row>
      <Table.RowHeaderCell>{inviteCode.id}</Table.RowHeaderCell>
      <Table.Cell>{inviteCode.used ? "Yes" : "No"}</Table.Cell>
      <Table.Cell>
        {inviteCode.usedAt
          ? formatDate(getDateFromFirebaseTimestamp(inviteCode.usedAt))
          : "-"}
      </Table.Cell>
      <Table.Cell>
        {inviteCode.usedBy ? inviteCode.usedBy.email : "-"}
      </Table.Cell>
      <Table.Cell>
        {inviteCode.issuedTo ? inviteCode.issuedTo.email : "-"}
      </Table.Cell>
    </Table.Row>
  );
};

export default function InviteCodeMonitorPage() {
  const { inviteCodes } = useInviteCodes();
  console.log("inviteCodes", inviteCodes);

  return (
    <div className={cn("w-full", "md:w-[70%]", "flex", "flex-col", "gap-y-4")}>
      <div className="flex flex-col gap-y-2 w-full">
        <AdminSectionTitle description="Manage invite events and view who used the invite codes.">
          Invite Code Monitor
        </AdminSectionTitle>
        <AdminSectionBox>
          <Table.Root className="w-full">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Code</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Used</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Used At</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Used By</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Referrer</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {inviteCodes
                ? inviteCodes.map((inviteCode) => (
                    <InviteCodeTableRow
                      key={inviteCode.id}
                      inviteCode={inviteCode}
                    />
                  ))
                : null}
            </Table.Body>
          </Table.Root>
        </AdminSectionBox>
      </div>
    </div>
  );
}

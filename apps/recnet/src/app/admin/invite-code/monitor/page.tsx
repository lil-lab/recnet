"use client";

import { cn } from "@/utils/cn";
import { AdminSectionBox, AdminSectionTitle } from "@/app/admin/AdminSections";
import { useInviteCodes } from "@/hooks/useInviteCodes";
import { Flex, Table, Text } from "@radix-ui/themes";
import { InviteCode } from "@/types/inviteCode";
import { getDateFromFirebaseTimestamp, formatDate } from "@/utils/date";
import { Avatar } from "@/components/Avatar";
import { RecNetLink } from "@/components/Link";
import { CopyIcon } from "@radix-ui/react-icons";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { toast } from "sonner";
import { TailSpin } from "react-loader-spinner";

const InviteCodeTableRow = (props: { inviteCode: InviteCode }) => {
  const { inviteCode } = props;
  const { copy } = useCopyToClipboard();

  return (
    <Table.Row className="align-middle">
      <Table.RowHeaderCell>
        <Flex
          className="gap-x-2 items-center cursor-pointer group"
          onClick={() => {
            copy(inviteCode.id).then(() => {
              // toast
              toast.success("Copied to clipboard!");
            });
          }}
        >
          {inviteCode.id}
          <CopyIcon className="text-gray-8 group-hover:text-gray-10 transition-all ease-in-out" />
        </Flex>
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
        {inviteCode.usedBy ? (
          <RecNetLink href={`/${inviteCode.usedBy.username}`}>
            <Flex gap="2" className="items-center gap-x-2">
              <Avatar
                user={inviteCode.usedBy}
                className={cn("w-[40px]", "h-[40px]")}
              />
              {inviteCode.usedBy.displayName}
            </Flex>
          </RecNetLink>
        ) : (
          "-"
        )}
      </Table.Cell>
      <Table.Cell>
        {inviteCode.issuedTo ? inviteCode.issuedTo.email : "-"}
      </Table.Cell>
    </Table.Row>
  );
};

export default function InviteCodeMonitorPage() {
  const { inviteCodes, isLoading } = useInviteCodes();

  return (
    <div className={cn("w-full", "md:w-[80%]", "flex", "flex-col", "gap-y-4")}>
      <div className="flex flex-col gap-y-2 w-full">
        <AdminSectionTitle description="Manage invite events and view who used the invite codes.">
          Invite Code Monitor
        </AdminSectionTitle>
        <AdminSectionBox>
          {inviteCodes && !isLoading ? (
            <Table.Root className="w-full max-h-[60svh] relative">
              <Table.Header className="sticky top-0 bg-white z-[1000]">
                <Table.Row>
                  <Table.ColumnHeaderCell>Code</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Used</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Used At</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Used By</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Owner</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {inviteCodes.map((inviteCode) => (
                  <InviteCodeTableRow
                    key={inviteCode.id}
                    inviteCode={inviteCode}
                  />
                ))}
              </Table.Body>
            </Table.Root>
          ) : (
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
          )}
        </AdminSectionBox>
      </div>
    </div>
  );
}

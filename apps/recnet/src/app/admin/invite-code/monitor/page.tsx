"use client";

import { cn } from "@recnet/recnet-web/utils/cn";
import {
  AdminSectionBox,
  AdminSectionTitle,
} from "@recnet/recnet-web/app/admin/AdminSections";
import { useInviteCodes } from "@recnet/recnet-web/hooks/useInviteCodes";
import { Flex, Table, Text } from "@radix-ui/themes";
import {
  getDateFromFirebaseTimestamp,
  formatDate,
} from "@recnet/recnet-web/utils/date";
import { Avatar } from "@recnet/recnet-web/components/Avatar";
import { RecNetLink } from "@recnet/recnet-web/components/Link";
import { TailSpin } from "react-loader-spinner";
import { User } from "@recnet/recnet-web/types/user";
import { CopiableInviteCode } from "@recnet/recnet-web/components/InviteCode";

const TableUserCard = (props: { user: User }) => {
  const { user } = props;
  return (
    <RecNetLink href={`/${user.username}`}>
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
  const { inviteCodes, isLoading } = useInviteCodes();

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
                  .filter((c) => c.used)
                  .map((inviteCode) => (
                    <Table.Row className="align-middle" key={inviteCode.id}>
                      <Table.RowHeaderCell>
                        <CopiableInviteCode inviteCode={inviteCode.id} />
                      </Table.RowHeaderCell>
                      <Table.Cell>
                        {inviteCode.usedAt
                          ? formatDate(
                              getDateFromFirebaseTimestamp(inviteCode.usedAt)
                            )
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
                        {inviteCode.issuedTo ? (
                          <TableUserCard user={inviteCode.issuedTo} />
                        ) : (
                          "-"
                        )}
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
                  .filter((c) => !c.used)
                  .map((inviteCode) => (
                    <Table.Row className="align-middle" key={inviteCode.id}>
                      <Table.RowHeaderCell>
                        <CopiableInviteCode inviteCode={inviteCode.id} />
                      </Table.RowHeaderCell>
                      <Table.Cell>
                        {inviteCode.issuedTo ? (
                          <TableUserCard user={inviteCode.issuedTo} />
                        ) : (
                          "-"
                        )}
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

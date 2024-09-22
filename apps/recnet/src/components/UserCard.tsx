"use client";

import { HomeIcon, Pencil1Icon, PersonIcon } from "@radix-ui/react-icons";
import { Flex, Text, Grid, Tooltip } from "@radix-ui/themes";

import { useAuth } from "@recnet/recnet-web/app/AuthContext";
import { Avatar } from "@recnet/recnet-web/components/Avatar";
import { FollowButton } from "@recnet/recnet-web/components/FollowButton";
import { RecNetLink } from "@recnet/recnet-web/components/Link";
import { cn } from "@recnet/recnet-web/utils/cn";

import { UserPreview } from "@recnet/recnet-api-model";

export function UserList({
  users,
  hideMe = false,
}: {
  users: UserPreview[];
  hideMe?: boolean;
}) {
  const { user: me } = useAuth();

  return (
    <Grid
      columns={{
        initial: "1",
        sm: "2",
        md: "3",
      }}
      gap="4"
    >
      {users.map((user, idx) => {
        if (hideMe && !!me && me.id === user.id) {
          return null;
        }
        return <UserCard key={`${user.handle}-${idx}`} user={user} />;
      })}
    </Grid>
  );
}

export function UserCard({ user }: { user: UserPreview }) {
  return (
    <div
      className={cn(
        "rounded-4",
        "border-slate-6",
        "shadow-2",
        "p-3",
        "flex",
        "flex-col",
        "gap-4"
      )}
    >
      <Avatar user={user} />
      <Flex className="flex-col gap-y-1">
        <RecNetLink href={`/${user.handle}`}>
          <Text>{user.displayName}</Text>
        </RecNetLink>
        <Text size="1" className="text-gray-12">
          {"@" + user.handle}
        </Text>
      </Flex>
      <Flex direction="column" className="items-start gap-[6px] text-gray-11">
        {user.affiliation ? (
          <Flex className="items-center gap-x-1 overflow-hidden">
            <HomeIcon width="16" height="16" className="min-w-min" />
            <Text size="1" className="truncate">
              {user.affiliation}
            </Text>
          </Flex>
        ) : null}
        <Flex className="items-center gap-x-2">
          <Tooltip content="Followers" side="top">
            <Flex className="items-center gap-x-1">
              <PersonIcon width="16" height="16" className="min-w-min" />
              <Text size="1">{user.numFollowers}</Text>
            </Flex>
          </Tooltip>
          <div className="w-[1px] h-[16px] bg-gray-6" />
          <Tooltip content="Recommendations" side="top">
            <Flex className="items-center gap-x-1 overflow-hidden">
              <Pencil1Icon width="16" height="16" className="min-w-min" />
              <Text size="1" className="truncate">
                {user.numRecs}
              </Text>
            </Flex>
          </Tooltip>
        </Flex>
      </Flex>
      <FollowButton user={user} className="mt-auto" />
    </div>
  );
}

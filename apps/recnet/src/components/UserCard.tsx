"use client";

import { HomeIcon, PersonIcon } from "@radix-ui/react-icons";
import { Flex, Text, Grid } from "@radix-ui/themes";

import { Avatar } from "@recnet/recnet-web/components/Avatar";
import { FollowButton } from "@recnet/recnet-web/components/FollowButton";
import { RecNetLink } from "@recnet/recnet-web/components/Link";
import { cn } from "@recnet/recnet-web/utils/cn";

import { UserPreview } from "@recnet/recnet-api-model";

export function UserList({ users }: { users: UserPreview[] }) {
  return (
    <Grid
      columns={{
        initial: "1",
        sm: "2",
        md: "3",
      }}
      gap="4"
    >
      {users.map((user, idx) => (
        <UserCard key={`${user.handle}-${idx}`} user={user} />
      ))}
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
      <Flex className="items-center gap-x-1">
        {user.affiliation ? (
          <Flex className="items-center gap-x-1 text-gray-11 overflow-hidden">
            <HomeIcon width="16" height="16" />
            <Text size="1" className="truncate">
              {user.affiliation}
            </Text>
            <Text size="1" className="ml-[6px]">
              /
            </Text>
          </Flex>
        ) : null}
        <Flex className="items-center gap-x-1 text-gray-11">
          <PersonIcon width="16" height="16" />
          <Text size="1">{user.numFollowers}</Text>
        </Flex>
      </Flex>
      <FollowButton user={user} />
    </div>
  );
}

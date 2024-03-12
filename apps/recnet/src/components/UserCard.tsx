"use client";

import { User } from "@recnet/recnet-web/types/user";
import { cn } from "@recnet/recnet-web/utils/cn";
import { Flex, Text, Grid } from "@radix-ui/themes";
import { RecNetLink } from "./Link";
import { HomeIcon, PersonIcon } from "@radix-ui/react-icons";
import { Avatar } from "@recnet/recnet-web/components/Avatar";
import { FollowButton } from "./FollowButton";
import { shuffleArray } from "@recnet/recnet-web/utils/shuffle";
import { useAuth } from "@recnet/recnet-web/app/AuthContext";

export function UserList({ users }: { users: User[] }) {
  const { user } = useAuth();
  const shuffledUsers = user?.seed ? shuffleArray(users, user.seed) : users;
  return (
    <Grid
      columns={{
        initial: "1",
        sm: "2",
        md: "3",
      }}
      gap="4"
    >
      {shuffledUsers.map((user, idx) => (
        <UserCard key={`${user.username}-${idx}`} user={user} />
      ))}
    </Grid>
  );
}

export function UserCard({ user }: { user: User }) {
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
        <RecNetLink href={`/${user.username}`}>
          <Text>{user.displayName}</Text>
        </RecNetLink>
        <Text size="1" className="text-gray-12">
          {"@" + user.username}
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
          <Text size="1">{user.followers.length}</Text>
        </Flex>
      </Flex>
      <FollowButton user={user} />
    </div>
  );
}

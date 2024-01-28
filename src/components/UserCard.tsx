"use client";
import { User } from "@/types/user";
import { cn } from "@/utils/cn";
import { Avatar, Button, Flex, Text } from "@radix-ui/themes";
import { getFallbackDisplayName } from "@/app/Headerbar";
import { RecNetLink } from "./Link";
import { HomeIcon, PersonIcon } from "@radix-ui/react-icons";
import { useAuth } from "@/app/AuthContext";
import { toast } from "sonner";

export function UserCard({ user }: { user: User }) {
  const { user: me } = useAuth();
  const isFollowing = me?.following.includes(user.seed);

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
      <Avatar
        src={user.photoURL}
        fallback={getFallbackDisplayName(user)}
        className="rounded-[999px]"
      />
      <Flex className="flex-col gap-y-1">
        <RecNetLink href={`/user/${user.username}`}>
          <Text>{user.displayName}</Text>
        </RecNetLink>
        <Text size="1" className="text-gray-12">
          {"@" + user.username}
        </Text>
      </Flex>
      <Flex className="items-center gap-x-1">
        {user.affiliation ? (
          <Flex className="items-center gap-x-1 text-gray-11">
            <HomeIcon width="16" height="16" />
            <Text size="1">{user.affiliation}</Text>
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
      <Button
        variant={isFollowing ? "outline" : "solid"}
        color={!me ? "gray" : "blue"}
        onClick={() => {
          if (!me) {
            toast.error("You must be logged in to follow someone.");
            return;
          }
          // TODO: follow/unfollow
          toast.info("Dev");
        }}
      >
        {isFollowing ? "Unfollow" : "Follow"}
      </Button>
    </div>
  );
}

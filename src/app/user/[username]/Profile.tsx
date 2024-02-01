"use client";

import { cn } from "@/utils/cn";
import { Button, Flex, Text } from "@radix-ui/themes";
import { Avatar } from "@/components/Avatar";
import { HomeIcon } from "@radix-ui/react-icons";
import { RecNetLink } from "@/components/Link";
import { useAuth } from "@/app/AuthContext";
import { FollowButton } from "@/components/FollowButton";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";

export function Profile(props: { username: string }) {
  const router = useRouter();
  const { username } = props;
  const { user, isLoading } = useUser(username, {
    onErrorCallback: () => {
      // redirect to 404 page
      router.replace("/404");
    },
  });
  const { user: me } = useAuth();
  const isMe = !!me && !!user && me.username === user.username;

  if (isLoading) {
    // TODO: finish skeleton loader
    return <Text>Loading...</Text>;
  }

  if (!user) {
    router.replace("/404");
    return null;
  }

  return (
    <div className={cn("flex-col", "gap-y-6", "flex")}>
      <Flex className="items-center p-3 gap-x-6">
        <Flex>
          <Avatar user={user} className={cn("w-[80px]", "h-[80px]")} />
        </Flex>
        <Flex className="flex-grow flex-col justify-between h-full">
          <Flex className="p-2 items-center gap-x-4 text-gray-11">
            <Text size="6" weight="medium">
              {user.displayName}
            </Text>
            <Text size="4">{"@" + user.username}</Text>
          </Flex>
          <Flex className="items-center gap-x-[10px] p-1">
            {user.affiliation ? (
              <Flex className="items-center gap-x-1 text-gray-11">
                <HomeIcon width="16" height="16" />
                <Text size="3">{user.affiliation}</Text>
                <Text size="3" className="ml-[6px]">
                  /
                </Text>
              </Flex>
            ) : null}
            <Flex className="items-center gap-x-1 text-gray-11">
              <Text size="3">{`${user.followers.length} Follower${user.followers.length > 1 ? "s" : ""}`}</Text>
            </Flex>
            {isMe ? (
              <Flex className="items-center gap-x-1 text-gray-11">
                <Text size="3" className="mr-[6px]">
                  /
                </Text>
                <RecNetLink
                  href={`/user/following`}
                  radixLinkProps={{
                    underline: "always",
                  }}
                >
                  <Text size="3">{`${me.following.length} Following${me.following.length > 1 ? "s" : ""}`}</Text>
                </RecNetLink>
              </Flex>
            ) : null}
          </Flex>
        </Flex>
      </Flex>
      <Flex className="w-full">
        {isMe ? (
          <Button
            className="w-full"
            variant="surface"
            onClick={() => {
              console.log("Edit button clicked");
              // TODO: Implement edit profile
            }}
          >
            Edit
          </Button>
        ) : (
          <FollowButton user={user} />
        )}
      </Flex>
    </div>
  );
}

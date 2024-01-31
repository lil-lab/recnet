"use client";

import { User } from "@/types/user";
import { cn } from "@/utils/cn";
import { Button, Flex, Text } from "@radix-ui/themes";
import { Avatar } from "@/components/Avatar";
import { HomeIcon } from "@radix-ui/react-icons";
import { RecNetLink } from "@/components/Link";
import { useAuth } from "@/app/AuthContext";
import { useState } from "react";
import { toast } from "sonner";
import { follow, unfollow } from "@/server/user";
import { TailSpin } from "react-loader-spinner";

export function Profile(props: { user: User }) {
  const { user } = props;
  const { user: me, revalidateUser } = useAuth();
  const isMe = me?.username === user.username;
  const isFollowing = me?.following.includes(user.seed);

  const [isLoading, setIsLoading] = useState(false);

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
                  <Text size="3">{`${user.following.length} Following${user.following.length > 1 ? "s" : ""}`}</Text>
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
          <Button
            className="w-full transition-all ease-in-out"
            variant={isFollowing ? "outline" : "solid"}
            onClick={async () => {
              if (!me) {
                toast.error("You must be logged in to follow someone.");
                return;
              }
              setIsLoading(true);
              if (isFollowing) {
                try {
                  await unfollow(me.seed, user.seed);
                  await revalidateUser();
                  toast.success(`Successfully unfollowed ${user.displayName}`);
                } catch (e) {
                  toast.error("Something went wrong.");
                }
              } else {
                try {
                  await follow(me.seed, user.seed);
                  await revalidateUser();
                  toast.success(`You're following ${user.displayName}`);
                } catch (e) {
                  toast.error("Something went wrong.");
                }
              }
              setIsLoading(false);
            }}
          >
            {isLoading ? (
              <TailSpin
                radius={"1"}
                visible={true}
                height="20"
                width="20"
                color={isFollowing ? "#2191FF" : "#ffffff"}
                ariaLabel="line-wave-loading"
                wrapperClass="w-fit h-fit"
              />
            ) : isFollowing ? (
              "Unfollow"
            ) : (
              "Follow"
            )}
          </Button>
        )}
      </Flex>
    </div>
  );
}

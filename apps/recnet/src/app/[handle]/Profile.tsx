"use client";

import { HomeIcon, Link2Icon } from "@radix-ui/react-icons";
import { Button, Flex, Text } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import React, { useMemo } from "react";

import { useAuth } from "@recnet/recnet-web/app/AuthContext";
import { trpc } from "@recnet/recnet-web/app/_trpc/client";
import { Avatar } from "@recnet/recnet-web/components/Avatar";
import { FollowButton } from "@recnet/recnet-web/components/FollowButton";
import { RecNetLink } from "@recnet/recnet-web/components/Link";
import { Skeleton, SkeletonText } from "@recnet/recnet-web/components/Skeleton";
import { cn } from "@recnet/recnet-web/utils/cn";
import { interleaveWithValue } from "@recnet/recnet-web/utils/interleaveWithValue";

import { UserSettingDialog } from "./UserSettingDialog";

function StatDivider() {
  return <div className="w-[1px] bg-gray-6 h-[18px] flex" />;
}

export function Profile(props: { handle: string }) {
  const router = useRouter();
  const { handle } = props;
  const { data, isPending, isFetching } = trpc.getUserByHandle.useQuery({
    handle,
  });
  const { user: me } = useAuth();
  const isMe = !!me && !!data?.user && me.handle === data.user.handle;

  const userUrl = useMemo(
    () => (data?.user?.url ? new URL(data.user.url) : null),
    [data]
  );

  const userStats = useMemo(() => {
    const components: JSX.Element[] = [];
    if (data?.user) {
      const numFollowers = (
        <Flex className="items-center gap-x-1">
          <Text size="2">{`${data.user.numFollowers} Follower${data.user.numFollowers > 1 ? "s" : ""}`}</Text>
        </Flex>
      );
      components.push(numFollowers);
    }
    if (isMe) {
      const followings = (
        <Flex className="items-center gap-x-1">
          <RecNetLink
            href={`/user/following`}
            radixLinkProps={{
              underline: "always",
            }}
          >
            <Text size="2">{`${me.following.length} Following${me.following.length > 1 ? "s" : ""}`}</Text>
          </RecNetLink>
        </Flex>
      );
      components.push(followings);
    }
    if (data?.user) {
      const numRecs = (
        <Flex className="items-center gap-x-1">
          <Text size="2">{`${data.user.numRecs} Rec${data.user.numRecs > 1 ? "s" : ""}`}</Text>
        </Flex>
      );
      components.push(numRecs);
    }
    const componentsWithDividers = interleaveWithValue(
      components,
      <StatDivider />
    );
    return (
      <Flex className="sm:items-center gap-x-[10px] p-2 sm:p-1 flex-wrap flex-row text-gray-11">
        {componentsWithDividers.map((stat, index) => (
          <React.Fragment key={`user-stat-${index}`}>{stat}</React.Fragment>
        ))}
      </Flex>
    );
  }, [data, isMe, me]);

  const userInfo = useMemo(() => {
    if (!data?.user) {
      return null;
    }
    return (
      <div className="flex flex-col justify-between h-full gap-y-1">
        {data.user.bio ? (
          <Flex className="w-full p-2 sm:p-1 my-1">
            <Text size="2" className="text-gray-11 whitespace-pre-line">
              {data.user.bio}
            </Text>
          </Flex>
        ) : null}
        {data.user.affiliation ? (
          <Flex className="items-center gap-x-1 text-gray-11 px-2 sm:px-1">
            <HomeIcon width="16" height="16" />
            <Text size="2">{data.user.affiliation}</Text>
          </Flex>
        ) : null}
        {userUrl ? (
          <Flex className="items-center gap-x-1 text-gray-11 px-2 sm:px-1">
            <Link2Icon width="16" height="16" />
            <RecNetLink href={userUrl.href}>
              <Text size="2">
                {userUrl.hostname}
                {userUrl.pathname === "/" ? null : userUrl.pathname}
              </Text>
            </RecNetLink>
          </Flex>
        ) : null}
        {userStats}
      </div>
    );
  }, [data, userStats, userUrl]);

  if (isPending || isFetching) {
    return (
      <div className={cn("flex-col", "gap-y-6", "flex")}>
        <Flex className="items-start p-3 gap-x-6">
          <Flex>
            <Skeleton className="w-[80px] h-[80px] rounded-[999px]" />
          </Flex>
          <Flex className="flex-grow flex-col justify-center h-full gap-y-1">
            <SkeletonText size="4" />
            <SkeletonText size="2" />
          </Flex>
        </Flex>
        <Flex className="w-full p-2 sm:p-1 my-1 flex-col gap-y-1">
          <SkeletonText size="2" className="w-[50%]" />
          <SkeletonText size="2" className="w-[50%]" />
          <SkeletonText size="2" className="w-[50%]" />
        </Flex>
        <Flex className="items-center p-1">
          <SkeletonText className="h-fit min-w-[300px]" size="2" />
        </Flex>
        <Flex className="w-full">
          <Button
            className="w-full p-0 overflow-hidden cursor-pointer"
            radius="medium"
            variant="surface"
            disabled
          >
            <SkeletonText size="3" className="h-full w-full" />
          </Button>
        </Flex>
      </div>
    );
  }

  if (!data?.user) {
    router.replace("/404");
    return null;
  }

  return (
    <div className={cn("flex-col", "gap-y-3", "md:gap-y-6", "flex")}>
      <Flex className="items-start p-3 gap-x-6">
        <Flex>
          <Avatar user={data.user} className={cn("w-[80px]", "h-[80px]")} />
        </Flex>
        <Flex className="flex-grow flex-col justify-between h-full gap-y-1">
          <Flex className="justify-between items-center">
            <Flex className="p-2 sm:p-1 sm:items-center gap-x-4 text-gray-11 flex-col sm:flex-row">
              <Text
                size={{
                  initial: "5",
                  sm: "6",
                }}
                weight="medium"
              >
                {data.user.displayName}
              </Text>
              <Text
                size={{
                  initial: "2",
                  sm: "3",
                }}
                className="text-gray-10 font-mono"
              >
                {"@" + data.user.handle}
              </Text>
            </Flex>
            <Flex className="w-fit hidden md:flex">
              {isMe ? (
                <UserSettingDialog handle={data.user.handle} />
              ) : (
                <FollowButton user={data.user} />
              )}
            </Flex>
          </Flex>
          <div className="hidden sm:flex">{userInfo}</div>
        </Flex>
      </Flex>
      <div className="sm:hidden">{userInfo}</div>
      <Flex className="w-full md:hidden">
        {isMe ? (
          <UserSettingDialog handle={data.user.handle} />
        ) : (
          <FollowButton user={data.user} />
        )}
      </Flex>
    </div>
  );
}

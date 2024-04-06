"use client";

import { Button, Text } from "@radix-ui/themes";
import { InfiniteData } from "@tanstack/react-query";
import { useMemo } from "react";

import { useAuth } from "@recnet/recnet-web/app/AuthContext";
import { GoBackButton } from "@recnet/recnet-web/components/GoBackButton";
import { UserList } from "@recnet/recnet-web/components/UserCard";
import { cn } from "@recnet/recnet-web/utils/cn";
import { shuffleArray } from "@recnet/recnet-web/utils/shuffle";

import { GetUsersResponse, UserPreview } from "@recnet/recnet-api-model";

import { NotFoundBlock } from "./NotFound";

import { trpc } from "../_trpc/client";

export const getShuffledUsersFromInfiniteQuery = (
  infiniteQueryData: InfiniteData<GetUsersResponse> | undefined,
  shuffleKey: string | undefined
) => {
  if (!infiniteQueryData) {
    return [];
  }
  return (infiniteQueryData?.pages ?? []).reduce((acc, page) => {
    const newBatch = shuffleArray(page.users, shuffleKey || "");
    return [...acc, ...newBatch];
  }, [] as UserPreview[]);
};

export default function SearchResultPage({
  searchParams,
}: {
  searchParams: {
    q: string;
  };
}) {
  const { user } = useAuth();
  const query = searchParams["q"];
  const { data, isPending, fetchNextPage } = trpc.search.useInfiniteQuery(
    {
      keyword: query,
      pageSize: 20,
    },
    {
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage.hasNext) {
          return null;
        }
        return allPages.length + 1;
      },
      initialCursor: 1,
    }
  );

  const users = useMemo(
    () => getShuffledUsersFromInfiniteQuery(data, user?.id),
    [data, user]
  );

  if (isPending) {
    // TODO: Add loading animation
    return <div>Loading...</div>;
  }

  return (
    <div
      className={cn(
        "w-full",
        "lg:w-[60%]",
        "sm:w-[80%]",
        `min-h-[90svh]`,
        "flex",
        "flex-col",
        "p-8",
        "gap-y-6"
      )}
    >
      <GoBackButton />
      <Button
        className="w-full"
        onClick={() => {
          fetchNextPage();
        }}
      >
        Load More
      </Button>
      <Text size="7" className="text-gray-12 font-medium">{`${
        users.length
      } result${users.length > 1 ? "s" : ""}`}</Text>
      {users.length === 0 ? <NotFoundBlock /> : <UserList users={users} />}
    </div>
  );
}

"use client";

import { Text } from "@radix-ui/themes";
import { useMemo } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

import { useAuth } from "@recnet/recnet-web/app/AuthContext";
import { GoBackButton } from "@recnet/recnet-web/components/GoBackButton";
import { LoadingBox } from "@recnet/recnet-web/components/LoadingBox";
import { UserList } from "@recnet/recnet-web/components/UserCard";
import { cn } from "@recnet/recnet-web/utils/cn";
import { getDataFromInfiniteQuery } from "@recnet/recnet-web/utils/getDataFromInfiniteQuery";
import { shuffleArray } from "@recnet/recnet-web/utils/shuffle";

import { NotFoundBlock } from "./NotFound";

import { trpc } from "../_trpc/client";

const PAGE_SIZE = 20;

export default function SearchResultPage({
  searchParams,
}: {
  searchParams: {
    q: string;
  };
}) {
  const { user } = useAuth();
  const query = searchParams["q"];
  const { data, isPending, fetchNextPage, hasNextPage } =
    trpc.search.useInfiniteQuery(
      {
        keyword: query,
        pageSize: PAGE_SIZE,
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

  const users = useMemo(() => {
    if (!data) return [];
    return getDataFromInfiniteQuery(data, (page) => {
      const nextBatch = shuffleArray(page.users, user?.id || "");
      return nextBatch;
    });
  }, [data, user]);

  if (isPending) {
    return <LoadingBox className="h-[95svh]" />;
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
      <Text size="7" className="text-gray-12 font-medium">{`${
        users.length
      } result${users.length > 1 ? "s" : ""}`}</Text>
      {users.length === 0 ? (
        <NotFoundBlock />
      ) : (
        <InfiniteScroll
          dataLength={users.length}
          next={fetchNextPage}
          hasMore={hasNextPage}
          loader={<LoadingBox className="h-[200px]" />}
          endMessage={null}
          className="p-1"
        >
          <UserList users={users} />
        </InfiniteScroll>
      )}
    </div>
  );
}

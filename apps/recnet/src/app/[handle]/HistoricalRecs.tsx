"use client";
import { Text } from "@radix-ui/themes";
import { InfiniteData } from "@tanstack/react-query";
import { useMemo } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

import {
  RecCard,
  RecCardSkeleton,
} from "@recnet/recnet-web/components/RecCard";

import { GetRecsResponse } from "@recnet/recnet-api-model";
import { Rec } from "@recnet/recnet-api-model";

import { trpc } from "../_trpc/client";

const PAGE_SIZE = 5;

const getHistoricalRecsFromInfiniteQuery = (
  infiniteQueryData: InfiniteData<GetRecsResponse> | undefined
) => {
  if (!infiniteQueryData) {
    return [];
  }
  return (infiniteQueryData?.pages ?? []).reduce((acc, page) => {
    return [...acc, ...page.recs];
  }, [] as Rec[]);
};

export function HistoricalRecs(props: { userId: string }) {
  const { userId } = props;

  const { data, isPending, fetchNextPage, hasNextPage } =
    trpc.getHistoricalRecs.useInfiniteQuery(
      {
        userId,
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

  const recs = useMemo(() => getHistoricalRecsFromInfiniteQuery(data), [data]);

  if (isPending) {
    return (
      <div className="flex flex-col gap-y-6 my-6">
        {Array.from({ length: PAGE_SIZE }).map((_, idx) => (
          <RecCardSkeleton key={idx} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex my-6">
      {recs.length === 0 ? (
        <div className="h-[150px] w-full flex justify-center items-center">
          <Text size="3" className="text-gray-10">
            No recommendations yet.
          </Text>
        </div>
      ) : (
        <InfiniteScroll
          dataLength={recs.length}
          next={fetchNextPage}
          hasMore={hasNextPage}
          loader={
            <div className="flex flex-col gap-y-6">
              {Array.from({ length: 2 }).map((_, idx) => (
                <RecCardSkeleton key={idx} />
              ))}
            </div>
          }
          endMessage={null}
          className="flex flex-col gap-y-6"
        >
          {recs.map((rec, idx) => {
            return <RecCard key={`${rec.id}-${idx}`} recs={[rec]} showDate />;
          })}
        </InfiniteScroll>
      )}
    </div>
  );
}

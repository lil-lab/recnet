"use client";

import { Text } from "@radix-ui/themes";
import { InfiniteData } from "@tanstack/react-query";
import groupBy from "lodash.groupby";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

import { RecCardSkeleton } from "@recnet/recnet-web/components/RecCard";
import { RecCard } from "@recnet/recnet-web/components/RecCard";
import { cn } from "@recnet/recnet-web/utils/cn";
import { notEmpty } from "@recnet/recnet-web/utils/notEmpty";
import { shuffleArray } from "@recnet/recnet-web/utils/shuffle";

import {
  getCutOff,
  getLatestCutOff,
  START_DATE,
} from "@recnet/recnet-date-fns";

import { GetRecsFeedsResponse, Rec } from "@recnet/recnet-api-model";

import { useAuth } from "../AuthContext";
import { trpc } from "../_trpc/client";

const PAGE_SIZE = 5;

const getShuffledRecsFromInfiniteQuery = (
  infiniteQueryData: InfiniteData<GetRecsFeedsResponse> | undefined,
  shuffleKey: string | undefined
) => {
  if (!infiniteQueryData) {
    return [];
  }
  return (infiniteQueryData?.pages ?? []).reduce((acc, page) => {
    const newBatch = shuffleArray(page.recs, shuffleKey || "");
    return [...acc, ...newBatch];
  }, [] as Rec[]);
};

export default function FeedPage({
  searchParams,
}: {
  searchParams: {
    date?: string;
  };
}) {
  const date = searchParams["date"];
  const { user } = useAuth();
  const router = useRouter();

  const cutoff = useMemo(() => {
    if (!date) {
      return getLatestCutOff();
    }
    const parsedDate = new Date(date);
    if (parsedDate.toString() === "Invalid Date") {
      router.push("/404");
    }
    // if it's earlier than the earliest date we support, redirect to notFound
    if (parsedDate.getTime() < START_DATE.getTime()) {
      console.log(
        "date is earlier than START_DATE",
        date,
        START_DATE.toISOString()
      );
      router.push("/404");
    }
    return getCutOff(parsedDate);
  }, [date, router]);

  const { data, isPending, hasNextPage, fetchNextPage } =
    trpc.getFeeds.useInfiniteQuery(
      {
        cutoff: cutoff.getTime(),
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
  const recs = useMemo(
    () => getShuffledRecsFromInfiniteQuery(data, user?.id),
    [data, user]
  );

  const recsGroupByTitle = useMemo(
    () =>
      groupBy(recs, (rec) => {
        const titleLowercase = rec.article.title.toLowerCase();
        const words = titleLowercase
          .split(" ")
          .filter((w) => w.length > 0)
          .filter(notEmpty);
        return words.join("");
      }),
    [recs]
  );

  if (isPending) {
    return (
      <div
        className={cn(
          "w-[80%]",
          "md:w-[65%]",
          "flex",
          "flex-col",
          "gap-y-4",
          "mx-auto",
          "py-12"
        )}
      >
        {Array.from({ length: 5 }).map((_, idx) => {
          return <RecCardSkeleton key={idx} />;
        })}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-[80%]",
        "md:w-[65%]",
        "flex",
        "flex-col",
        "mx-auto",
        "py-4",
        "md:py-12"
      )}
    >
      {Object.keys(recsGroupByTitle).length > 0 ? (
        <InfiniteScroll
          dataLength={Object.keys(recsGroupByTitle).length}
          next={fetchNextPage}
          hasMore={hasNextPage}
          loader={<RecCardSkeleton />}
          className="flex flex-col gap-y-4"
        >
          {Object.keys(recsGroupByTitle).map((recTitle, idx) => {
            const recs = recsGroupByTitle[recTitle];
            return <RecCard key={`${recTitle}-${idx}`} recs={recs} />;
          })}
        </InfiniteScroll>
      ) : (
        <div className="h-[150px] w-full flex justify-center items-center">
          <Text size="3" className="text-gray-10">
            No recommendations from your network this week.
          </Text>
        </div>
      )}
    </div>
  );
}

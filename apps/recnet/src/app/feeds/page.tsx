"use client";

import { Text } from "@radix-ui/themes";
import groupBy from "lodash.groupby";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

import { RecCardSkeleton } from "@recnet/recnet-web/components/RecCard";
import { RecCard } from "@recnet/recnet-web/components/RecCard";
import { cn } from "@recnet/recnet-web/utils/cn";
import { getDataFromInfiniteQuery } from "@recnet/recnet-web/utils/getDataFromInfiniteQuery";
import { notEmpty } from "@recnet/recnet-web/utils/notEmpty";

import {
  getCutOff,
  getLatestCutOff,
  START_DATE,
  formatDate,
} from "@recnet/recnet-date-fns";

import { trpc } from "../_trpc/client";
import { OnboardingDialog } from "../onboard/OnboardingDialog";

const PAGE_SIZE = 5;

export default function FeedPage({
  searchParams,
}: {
  searchParams: {
    date?: string;
  };
}) {
  const date = searchParams["date"];
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
  const recs = useMemo(() => {
    if (!data) {
      return [];
    }
    return getDataFromInfiniteQuery(data, (page) => {
      return page.recs;
    });
  }, [data]);

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
      <OnboardingDialog />
      {Object.keys(recsGroupByTitle).length > 0 ? (
        <>
          <div className="w-full mb-2 hidden md:flex flex-row justify-start">
            <Text size="1" className="text-gray-10">
              Current cycle: {formatDate(cutoff)}
            </Text>
          </div>
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
        </>
      ) : (
        <div className="h-[150px] w-full flex justify-center items-center">
          <Text size="3" className="text-gray-10">
            No recommendations from your network on {formatDate(cutoff)}.
          </Text>
        </div>
      )}
    </div>
  );
}

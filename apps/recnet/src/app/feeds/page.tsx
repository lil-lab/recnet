"use client";

import { Text } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

import { useAuth } from "@recnet/recnet-web/app/AuthContext";
import {
  ActivityCard,
  RecCardSkeleton,
} from "@recnet/recnet-web/components/RecCard";
import { cn } from "@recnet/recnet-web/utils/cn";
import { getDataFromInfiniteQuery } from "@recnet/recnet-web/utils/getDataFromInfiniteQuery";

import {
  getCutOff,
  getLatestCutOff,
  START_DATE,
  formatDate,
} from "@recnet/recnet-date-fns";

import { GetActivitiesFeedsResponse } from "@recnet/recnet-api-model";

import { SlackOAuthModal } from "./SlackOAuthModal";

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
  const { user } = useAuth();
  const userId = user?.id;
  const queryUserId = userId ?? "";
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

  const renderLoadingState = () => (
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

  const {
    data,
    isPending,
    hasNextPage = false,
    fetchNextPage,
    isFetchingNextPage,
  } = trpc.getActivitiesFeeds.useInfiniteQuery(
    {
      userId: queryUserId,
      pageSize: PAGE_SIZE,
    },
    {
      getNextPageParam: (
        lastPage: GetActivitiesFeedsResponse,
        allPages: GetActivitiesFeedsResponse[]
      ) => {
        if (!lastPage.hasNext) {
          return null;
        }
        return allPages.length + 1;
      },
      initialCursor: 1,
    } as Parameters<typeof trpc.getActivitiesFeeds.useInfiniteQuery>[1]
  );
  const activities = useMemo(() => {
    if (!data) {
      return [];
    }
    return getDataFromInfiniteQuery(data, (page) => {
      return page.activities;
    });
  }, [data]);

  const cycleRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());

  const activitiesWithCycleHeaders = useMemo(() => {
    const items: JSX.Element[] = [];
    let lastCycleTs: number | null = null;
    cycleRefs.current.clear();

    activities.forEach((activity, idx) => {
      const timestamp = new Date(activity.timestamp);
      if (!Number.isNaN(timestamp.getTime())) {
        const cycleDate = getCutOff(timestamp);
        const cycleTs = cycleDate.getTime();
        if (lastCycleTs !== cycleTs) {
          const isFirstCycle = lastCycleTs === null;
          items.push(
            <div
              key={`cycle-${cycleTs}`}
              className={cn(
                "w-full mb-2 flex flex-row justify-start",
                isFirstCycle ? "mt-0" : "mt-6"
              )}
              ref={(node) => {
                if (node) {
                  cycleRefs.current.set(cycleTs, node);
                } else {
                  cycleRefs.current.delete(cycleTs);
                }
              }}
            >
              <Text size="1" className="text-gray-10">
                Cycle: {formatDate(cycleDate)}
              </Text>
            </div>
          );
          lastCycleTs = cycleTs;
        }
      }

      items.push(
        <ActivityCard
          key={`${activity.data.id}-${idx}`}
          activity={activity}
          showDate
        />
      );
    });

    return items;
  }, [activities]);

  useEffect(() => {
    if (!activities.length) {
      return;
    }
    const targetCycle = cycleRefs.current.get(cutoff.getTime());
    if (targetCycle) {
      targetCycle.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [
    activities.length,
    cutoff,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  ]);

  if (isPending || !userId) {
    return renderLoadingState();
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
      <SlackOAuthModal />
      <OnboardingDialog />
      {activities.length > 0 ? (
        <>
          <InfiniteScroll
            dataLength={activities.length}
            next={fetchNextPage}
            hasMore={hasNextPage}
            loader={<RecCardSkeleton />}
            className="flex flex-col gap-y-4"
          >
            {activitiesWithCycleHeaders}
          </InfiniteScroll>
        </>
      ) : (
        <div className="h-[150px] w-full flex justify-center items-center">
          <Text size="3" className="text-gray-10">
            No activities from your network on {formatDate(cutoff)}.
          </Text>
        </div>
      )}
    </div>
  );
}

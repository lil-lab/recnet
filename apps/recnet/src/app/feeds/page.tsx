"use client";

import { Text } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
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
          <div className="w-full mb-2 hidden md:flex flex-row justify-start">
            <Text size="1" className="text-gray-10">
              Current cycle: {formatDate(cutoff)}
            </Text>
          </div>
          <InfiniteScroll
            dataLength={activities.length}
            next={fetchNextPage}
            hasMore={hasNextPage}
            loader={<RecCardSkeleton />}
            className="flex flex-col gap-y-4"
          >
            {activities.map((activity, idx) => {
              return (
                <ActivityCard
                  key={`${activity.data.id}-${idx}`}
                  activity={activity}
                  showDate
                />
              );
            })}
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

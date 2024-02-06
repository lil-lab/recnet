"use client";

import { RecNetLink } from "@/components/Link";
import { cn } from "@/utils/cn";
import {
  getCutOffFromStartDate,
  getCutOff,
  getLatestCutOff,
  getNextCutOff,
  getDateFromFirebaseTimestamp,
  getVerboseDateString,
} from "@/utils/date";
import { Text, Flex, Button } from "@radix-ui/themes";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/app/AuthContext";
import { useRec } from "@/hooks/useRec";
import { Pencil1Icon } from "@radix-ui/react-icons";

export function LeftPanel() {
  const searchParams = useSearchParams();
  const date = searchParams.get("date");
  const cutoff = date ? getCutOff(new Date(date)) : getLatestCutOff();
  const cutoffs = getCutOffFromStartDate();
  const { user } = useAuth();
  const lastPostId = user?.postIds
    ? user.postIds[user.postIds.length - 1]
    : null;
  const { rec } = useRec(lastPostId);
  const hasRecInThisCycle =
    rec &&
    getDateFromFirebaseTimestamp(rec.cutoff).getTime() ===
      getNextCutOff().getTime();

  if (!user) {
    // his should never happen, since the user should be authenticated to be here
    // just for narrowing the type
    return null;
  }

  return (
    <div
      className={cn(
        "w-[17%]",
        `min-h-[90svh]`,
        "border-r-[1px]",
        "border-gray-6",
        "p-4"
      )}
    >
      <div
        className={cn("flex", "flex-col", "gap-y-3", "sticky", "top-[80px]")}
      >
        <Text size="2" className="text-gray-11 p-1" weight="medium">
          {hasRecInThisCycle ? "PLACEHOLDER" : `Hi, ${user.displayName} 👋`}
        </Text>
        <Text size="2" className="text-gray-11 p-1" weight="medium">
          {hasRecInThisCycle
            ? "PLACEHOLDER"
            : `Anything interesting this week?`}
        </Text>
        <Flex className="w-full">
          {hasRecInThisCycle ? (
            "PLACEHOLDER"
          ) : (
            <Button size="3" className="w-full">
              <Pencil1Icon width="16" height="16" />
              Recommend a paper
            </Button>
          )}
        </Flex>
        <Text size="1" weight="medium" className="text-gray-9 p-1">
          {`This cycle concludes on ${getVerboseDateString(getNextCutOff())}
          time.`}
        </Text>
        <div className="w-full h-[1px] bg-gray-8" />
        <div className="w-full p-2 flex flex-col gap-y-2">
          <Text size="1" weight={"medium"} className="text-gray-11">
            Previous cycles
          </Text>
          <div className="flex flex-col py-1 px-2 gap-y-2">
            {cutoffs.map((d, idx) => {
              const year = d.getFullYear();
              const month = d.getMonth() + 1;
              const day = d.getDate();
              const key = `${month}/${day}/${year}`;
              return (
                <RecNetLink
                  href={`/feeds?date=${key}`}
                  key={idx}
                  radixLinkProps={{
                    size: "1",
                    weight:
                      cutoff.getTime() === d.getTime() ? "bold" : "regular",
                  }}
                >
                  {key}
                </RecNetLink>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

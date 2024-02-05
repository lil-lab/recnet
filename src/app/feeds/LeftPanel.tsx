"use client";

import { RecNetLink } from "@/components/Link";
import { cn } from "@/utils/cn";
import {
  getCutOffFromStartDate,
  getCutOff,
  getLatestCutOff,
} from "@/utils/date";
import { Text } from "@radix-ui/themes";
import { useSearchParams } from "next/navigation";

export function LeftPanel() {
  const searchParams = useSearchParams();
  const date = searchParams.get("date");
  const cutoff = date ? getCutOff(new Date(date)) : getLatestCutOff();
  const cutoffs = getCutOffFromStartDate();

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
        <Text size="2" className="text-gray-10">
          Left bar: under construction 🚧
        </Text>
        <Text size="2" className="text-gray-10">
          Left bar: under construction 🚧
        </Text>
        <Text size="2" className="text-gray-10">
          Left bar: under construction 🚧
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

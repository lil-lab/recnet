"use client";

import { Button, Text } from "@radix-ui/themes";
import { useRouter } from "next/navigation";

import { DatePicker } from "@recnet/recnet-web/components/DatePicker";
import { RecNetLink } from "@recnet/recnet-web/components/Link";

import {
  formatDate,
  START_DATE,
  getCutOffFromStartDate,
} from "@recnet/recnet-date-fns";

const MAX_CUTOFFS_DISPLAY = 5;

function getFeedPageLink(date: Date) {
  return `/feeds?date=${formatDate(date)}`;
}

interface CutoffDatePickerProps {
  currentSelectedCutoff: Date;
}

export function CutoffDatePicker(props: CutoffDatePickerProps) {
  const { currentSelectedCutoff } = props;
  const now = new Date();
  const router = useRouter();

  const shouldDisable = (d: Date) => {
    // outside of START_DATE and now
    if (d > now || d < START_DATE) {
      return true;
    }
    if (d.getDay() !== 2) {
      return true;
    }
    return false;
  };
  const onDateChange = (date: Date) => {
    const link = getFeedPageLink(date);
    router.push(link);
  };

  const cutoffs = getCutOffFromStartDate();

  return (
    <div className="w-full flex flex-col gap-y-1">
      <Text
        size="1"
        weight={"medium"}
        className="text-gray-11 cursor-pointer hover:bg-gray-3 hover:text-gray-12 transition-all ease-in-out rounded-2 p-2 select-none"
      >
        Previous cycles
      </Text>
      <div className="flex flex-col py-1 mx-2 px-3 gap-y-2 border-l-[1px] border-gray-4">
        {cutoffs.slice(0, MAX_CUTOFFS_DISPLAY).map((d, idx) => {
          const key = formatDate(d);
          return (
            <RecNetLink
              href={getFeedPageLink(d)}
              key={idx}
              radixLinkProps={{
                size: "1",
                weight:
                  currentSelectedCutoff.getTime() === d.getTime()
                    ? "bold"
                    : "regular",
              }}
            >
              {key}
            </RecNetLink>
          );
        })}
        <DatePicker
          value={currentSelectedCutoff}
          onChange={onDateChange}
          shouldDisable={shouldDisable}
          renderTrigger={() => (
            <Button variant="ghost" className="w-fit cursor-pointer" size="1">
              More
            </Button>
          )}
          popoverContentProps={{
            side: "right",
            alignOffset: -50,
          }}
        />
      </div>
    </div>
  );
}

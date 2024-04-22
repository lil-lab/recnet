"use client";

import { useCalendar } from "@h6s/calendar";
import { Button, Popover, Flex } from "@radix-ui/themes";

import { RecNetLink } from "@recnet/recnet-web/components/Link";
import { cn } from "@recnet/recnet-web/utils/cn";

import { getCutOffFromStartDate, START_DATE } from "@recnet/recnet-date-fns";

const MAX_CUTOFFS_DISPLAY = 5;

function getWeekDay(date: Date) {
  return Intl.DateTimeFormat("default", {
    weekday: "short",
  }).format(date);
}

function getFeedPageLink(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `/feeds?date=${month}/${day}/${year}`;
}

interface CutoffDatePickerProps {
  currentSelectedCutoff: Date;
}

export function CutoffDatePicker(props: CutoffDatePickerProps) {
  const { currentSelectedCutoff } = props;
  const cutoffs = getCutOffFromStartDate();
  const {
    headers,
    body,
    view,
    month: currentSelectedMonth,
    year: currentSelectedYear,
    navigation,
  } = useCalendar();
  const now = new Date();
  const firstDayOfNextMonth = new Date(
    currentSelectedYear,
    currentSelectedMonth + 1,
    1
  );
  const firstDayOfPrevMonth = new Date(
    currentSelectedYear,
    currentSelectedMonth,
    1
  );

  const tableCellBaseClass = "font-[12px] text-gray-9 px-1";

  return (
    <div className="flex flex-col py-1 px-2 gap-y-2">
      {cutoffs.slice(0, MAX_CUTOFFS_DISPLAY).map((d, idx) => {
        const year = d.getFullYear();
        const month = d.getMonth() + 1;
        const day = d.getDate();
        const key = `${month}/${day}/${year}`;
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
      <Popover.Root>
        <Popover.Trigger>
          <Button variant="ghost" className="w-fit cursor-pointer" size="1">
            More
          </Button>
        </Popover.Trigger>
        <Popover.Content>
          <Flex className="justify-center items-center w-full p-2 mb-2">
            <Button
              variant="ghost"
              className="mr-auto"
              disabled={firstDayOfPrevMonth < START_DATE}
              onClick={() => {
                navigation.toPrev();
              }}
            >
              Previous
            </Button>
            <div className="font-medium text-gray-10">
              {currentSelectedYear}.
              {(currentSelectedMonth + 1).toString().padStart(2, "0")}
            </div>
            <Button
              variant="ghost"
              className=" ml-auto"
              disabled={firstDayOfNextMonth > now}
              onClick={() => {
                navigation.toNext();
              }}
            >
              Next
            </Button>
          </Flex>
          <table className="table-fixed border-separate border-spacing-2">
            <thead>
              <tr>
                {headers.weekDays.map(({ key, value }) => {
                  return (
                    <th
                      key={key}
                      className="font-[12px] text-gray-10 w-[40px] text-start"
                    >
                      {getWeekDay(value)}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {body.value.map(({ key, value: days }) => {
                return (
                  <tr key={key}>
                    {days.map(({ key: dayKey, value }) => {
                      const tableCellWeekDay = value.getDay();
                      const tableCellMonth = value.getMonth();
                      if (
                        tableCellMonth !== currentSelectedMonth ||
                        value > now ||
                        value < START_DATE
                      ) {
                        return (
                          <td
                            key={dayKey}
                            className={cn(
                              tableCellBaseClass,
                              "cursor-not-allowed text-gray-6"
                            )}
                          >
                            {value.getDate()}
                          </td>
                        );
                      }
                      if (tableCellWeekDay !== 2) {
                        return (
                          <td
                            key={dayKey}
                            className={cn(
                              "cursor-not-allowed",
                              tableCellBaseClass
                            )}
                          >
                            {value.getDate()}
                          </td>
                        );
                      }
                      return (
                        <td key={dayKey} className={cn(tableCellBaseClass)}>
                          <RecNetLink href={getFeedPageLink(value)}>
                            {value.getDate()}
                          </RecNetLink>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Popover.Content>
      </Popover.Root>
    </div>
  );
}

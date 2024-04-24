"use client";

import { useCalendar } from "@h6s/calendar";
import { Button, Popover, Flex, Grid } from "@radix-ui/themes";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { RecNetLink } from "@recnet/recnet-web/components/Link";
import { cn } from "@recnet/recnet-web/utils/cn";

import {
  formatDate,
  getCutOffFromStartDate,
  monthValMap,
  START_DATE,
  WeekTs,
} from "@recnet/recnet-date-fns";

const MAX_CUTOFFS_DISPLAY = 5;

function getWeekDay(date: Date) {
  return Intl.DateTimeFormat("default", {
    weekday: "short",
  }).format(date);
}

function getFeedPageLink(date: Date) {
  return `/feeds?date=${formatDate(date)}`;
}

function clampSelectedYearMonth(_date: Date, min: Date, max: Date) {
  return new Date(
    Math.min(Math.max(_date.getTime(), min.getTime()), max.getTime())
  );
}

interface CutoffDatePickerProps {
  currentSelectedCutoff: Date;
}

type View = "default" | "month" | "year";

export function CutoffDatePicker(props: CutoffDatePickerProps) {
  const { currentSelectedCutoff } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<View>("default");

  const cutoffs = getCutOffFromStartDate();
  const {
    headers,
    body,
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

  // get years from START_DATE to now
  const startYear = new Date(START_DATE).getFullYear();
  const years = [];
  for (let i = startYear; i <= now.getFullYear(); i++) {
    years.push(i);
  }

  return (
    <div className="flex flex-col py-1 px-2 gap-y-2">
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
      <Popover.Root
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          // reset view on open and reset to today
          if (open) {
            navigation.setToday();
            setView("default");
          }
        }}
      >
        <Popover.Trigger>
          <Button variant="ghost" className="w-fit cursor-pointer" size="1">
            More
          </Button>
        </Popover.Trigger>
        <Popover.Content className="overflow-hidden" side="right">
          <Flex className="justify-center items-center w-full p-2 mb-2">
            <Button
              variant="ghost"
              className="mr-auto cursor-pointer"
              disabled={firstDayOfPrevMonth < START_DATE}
              onClick={() => {
                navigation.toPrev();
              }}
            >
              Previous
            </Button>
            <div className="font-medium text-gray-10 flex">
              <Button
                variant="ghost"
                size="3"
                className="m-0 p-2 cursor-pointer"
                onClick={() => {
                  if (view === "year") {
                    setView("default");
                  } else {
                    setView("year");
                  }
                }}
              >
                {currentSelectedYear}
              </Button>
              <Button
                variant="ghost"
                size="3"
                className="m-0 p-2 cursor-pointer"
                onClick={() => {
                  if (view === "month") {
                    setView("default");
                  } else {
                    setView("month");
                  }
                }}
              >
                {(currentSelectedMonth + 1).toString().padStart(2, "0")}
              </Button>
            </div>
            <Button
              variant="ghost"
              className=" ml-auto cursor-pointer"
              disabled={firstDayOfNextMonth > now}
              onClick={() => {
                navigation.toNext();
              }}
            >
              Next
            </Button>
          </Flex>
          <AnimatePresence initial={false} mode="sync">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ duration: 0.15, delay: 0.15 }}
              key={view}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, delay: 0.15 }}
                key={view + "-content"}
              >
                {view === "default" ? (
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
                              value.setUTCHours(23, 59, 59, 999);
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
                                <td
                                  key={dayKey}
                                  className={cn(tableCellBaseClass)}
                                >
                                  <RecNetLink
                                    href={getFeedPageLink(value)}
                                    radixLinkProps={{
                                      className: cn({
                                        "font-bold":
                                          formatDate(currentSelectedCutoff) ===
                                          formatDate(value),
                                      }),
                                      onClick: () => {
                                        setIsOpen(false);
                                      },
                                    }}
                                  >
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
                ) : view === "month" ? (
                  <Grid columns={"4"} gap={"2"} className="w-[344px]">
                    {Object.entries(monthValMap).map(([key, value]) => {
                      // disable if that month is before START_DATE or after now
                      const anchorDate = new Date(
                        currentSelectedYear,
                        value,
                        1
                      );
                      const shouldDisabled =
                        anchorDate.getTime() <
                          START_DATE.getTime() - WeekTs * 4 ||
                        anchorDate.getTime() > now.getTime();
                      return (
                        <Button
                          variant="ghost"
                          key={key}
                          className={cn(
                            "group cursor-pointer border-[1px] border-solid border-gray-6 p-1 m-0",
                            {
                              "cursor-not-allowed text-gray-6": shouldDisabled,
                            }
                          )}
                          onClick={() => {
                            navigation.setDate(
                              clampSelectedYearMonth(
                                anchorDate,
                                START_DATE,
                                now
                              )
                            );
                            setView("default");
                          }}
                          disabled={shouldDisabled}
                        >
                          <p
                            className={cn(
                              "text-gray-11 group-hover:text-gray-12 transition-all ease-in-out",
                              {
                                "text-gray-6 group-hover:text-gray-6":
                                  shouldDisabled,
                              }
                            )}
                          >
                            {key}
                          </p>
                        </Button>
                      );
                    })}
                  </Grid>
                ) : (
                  <Grid columns={"4"} gap={"2"} className="w-[344px]">
                    {years.map((year) => {
                      return (
                        <Button
                          variant="ghost"
                          key={year}
                          className="group cursor-pointer border-[1px] border-solid border-gray-6 p-1 m-0"
                          onClick={() => {
                            navigation.setDate(
                              clampSelectedYearMonth(
                                new Date(year, currentSelectedMonth, 1),
                                START_DATE,
                                now
                              )
                            );
                            setView("default");
                          }}
                        >
                          <p className="text-gray-11 group-hover:text-gray-12 transition-all ease-in-out">
                            {year}
                          </p>
                        </Button>
                      );
                    })}
                  </Grid>
                )}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </Popover.Content>
      </Popover.Root>
    </div>
  );
}

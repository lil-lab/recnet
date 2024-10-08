"use client";

import { useCalendar } from "@h6s/calendar";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import { Button, Popover, Flex, Grid, Text, TextField } from "@radix-ui/themes";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { cn } from "@recnet/recnet-web/utils/cn";

import {
  START_DATE,
  getVerboseDateString,
  monthValMap,
} from "@recnet/recnet-date-fns";

function getWeekDay(date: Date) {
  return Intl.DateTimeFormat("default", {
    weekday: "short",
  }).format(date);
}

const timeSelectFormSchema = z.object({
  hour: z.number().int().min(0).max(23),
  minute: z.number().int().min(0).max(59),
});

function TimeSelector(props: {
  selectedDate: Date;
  onSubmit: (date: Date) => void;
  onCancel: () => void;
}) {
  const { selectedDate, onSubmit, onCancel } = props;

  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(timeSelectFormSchema),
    defaultValues: {
      hour: 12,
      minute: 0,
    },
    mode: "onTouched",
  });

  return (
    <div className="flex flex-col gap-y-2">
      <Button variant="ghost" onClick={onCancel} className="w-fit">
        <ChevronLeftIcon />
        Cancel
      </Button>
      <Text size="1" className="text-gray-11 mt-2">
        Selected Date:{" "}
        {getVerboseDateString(selectedDate, {
          year: "numeric",
          withTime: false,
        })}
      </Text>
      <Flex className="items-end gap-x-2">
        <div className="flex flex-col gap-y-2 w-fit">
          <Text size="1" className="text-gray-10">
            Hour
          </Text>
          <TextField.Root
            type="number"
            {...register("hour", {
              valueAsNumber: true,
            })}
            className="w-[40px]"
          />
        </div>
        <Text size="2" className="text-gray-10 mb-2">
          :
        </Text>
        <div className="flex flex-col gap-y-2 w-fit">
          <Text size="1" className="text-gray-10">
            Minute
          </Text>
          <TextField.Root
            type="number"
            {...register("minute", {
              valueAsNumber: true,
            })}
            className="w-[40px]"
          />
        </div>
      </Flex>
      <div className="flex flex-col gap-y-1">
        {formState.errors.hour ? (
          <Text size="1" color="red">
            - {formState.errors.hour.message}
          </Text>
        ) : null}
        {formState.errors.minute ? (
          <Text size="1" color="red">
            - {formState.errors.minute.message}
          </Text>
        ) : null}
      </div>
      <Flex className="justify-end w-full">
        <Button
          disabled={formState.isSubmitting}
          className={cn("bg-blue-10", "cursor-pointer", "w-full", "mt-2")}
          onClick={() => {
            handleSubmit((data) => {
              const newDate = new Date(selectedDate);
              newDate.setHours(data.hour);
              newDate.setMinutes(data.minute);
              newDate.setSeconds(0);
              onSubmit(newDate);
            })();
          }}
        >
          Select
        </Button>
      </Flex>
    </div>
  );
}

type View = "default" | "month" | "year";

interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  renderTrigger: (val?: Date) => React.ReactNode;
  mode?: "date" | "datetime";
  shouldDisable?: (date: Date) => boolean;
  popoverContentProps?: React.ComponentProps<typeof Popover.Content>;
}

/**
 * RecNet's date picker component.
 * Built on top of the `@h6s/calendar` package and radix popover component.
 *
 * @param props.value The current value of the date picker.
 * @param props.onChange The function to call when the date picker value changes.
 * @param props.renderTrigger The function to render the trigger component.
 * @param props.mode The mode of the date picker. Can be either "date" or "datetime". "datetime" allows the user to select the time as well.
 * @param props.disableRule The function to determine if a date should be disabled. Return true to disable the date.
 */

export function DatePicker(props: DatePickerProps) {
  const {
    value,
    onChange,
    renderTrigger,
    mode = "date",
    shouldDisable = () => false,
    popoverContentProps = {},
  } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<View>("default");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const {
    headers,
    body,
    month: currentSelectedMonth,
    year: currentSelectedYear,
    navigation,
  } = useCalendar();

  const tableCellBaseClass = "font-[12px] text-gray-9 px-1";

  // get years from START_DATE to current year +- 10
  const now = new Date();
  const startYear = new Date(START_DATE).getFullYear();
  const years: number[] = [];
  for (let i = startYear - 10; i <= now.getFullYear() + 10; i++) {
    years.push(i);
  }

  return (
    <Popover.Root
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        // reset view & selectedDate on open
        // and navigate to the current selected date
        if (open) {
          navigation.setDate(new Date(value));
          setSelectedDate(null);
          setView("default");
        }
      }}
    >
      <Popover.Trigger className="cursor-pointer">
        {renderTrigger(value)}
      </Popover.Trigger>
      <Popover.Content
        className="overflow-hidden"
        maxWidth={"376px"}
        minWidth={"376px"}
        side="bottom"
        {...popoverContentProps}
      >
        {selectedDate ? (
          <div className="flex flex-col p-2">
            <TimeSelector
              selectedDate={selectedDate}
              onSubmit={(date) => {
                onChange(date);
                setIsOpen(false);
              }}
              onCancel={() => {
                setSelectedDate(null);
              }}
            />
          </div>
        ) : (
          <div className="flex flex-col w-full">
            <Flex className="justify-center items-center w-full p-2 mb-2">
              <Button
                variant="ghost"
                className="mr-auto cursor-pointer"
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
                    <div className="w-fit">
                      <table className="table-fixed border-separate border-spacing-2 w-full">
                        <thead>
                          <tr>
                            {headers.weekDays.map(({ key, value }) => {
                              return (
                                <th
                                  key={key}
                                  className="font-[12px] text-gray-10 w-[40px] text-start"
                                >
                                  <div className="flex flex-row justify-center">
                                    {getWeekDay(value)}
                                  </div>
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          {body.value.map(({ key, value: days }) => {
                            return (
                              <tr key={key}>
                                {days.map(({ key: dayKey, value: v }) => {
                                  const isToday =
                                    v.toDateString() === now.toDateString();
                                  const isSelected =
                                    value.toDateString() === v.toDateString();
                                  const highlightBasePseudoClass = cn(
                                    "after:content-[''] after:w-[28px] after:h-[28px] after:absolute after:z-[-1] after:rounded-[999px]",
                                    "after:top-1/2 after:left-1/2 after:transform after:-translate-x-1/2 after:-translate-y-1/2"
                                  );
                                  const highlightPseudoClass =
                                    !isSelected && !isToday
                                      ? ""
                                      : cn(
                                          highlightBasePseudoClass,
                                          isToday
                                            ? "after:border-[1px] after:border-blue-10"
                                            : null,
                                          isSelected ? "after:bg-blue-4" : null
                                        );

                                  const isNotThisMonth =
                                    v.getMonth() !== currentSelectedMonth;
                                  if (isNotThisMonth) {
                                    return (
                                      <td
                                        key={dayKey}
                                        className={cn(
                                          tableCellBaseClass,
                                          "cursor-not-allowed text-gray-6"
                                        )}
                                      >
                                        <div className="flex flex-row justify-center">
                                          {v.getDate()}
                                        </div>
                                      </td>
                                    );
                                  }

                                  const isDisabled = shouldDisable(v);
                                  return (
                                    <td
                                      key={dayKey}
                                      className={cn(
                                        tableCellBaseClass,
                                        !isDisabled
                                          ? "cursor-pointer text-gray-11 hover:text-blue-10"
                                          : "cursor-not-allowed",
                                        "transition-all ease-in-out"
                                      )}
                                      onClick={() => {
                                        if (isDisabled) return;
                                        // if mode is "datetime", proceed to time selector
                                        if (mode === "datetime") {
                                          setSelectedDate(v);
                                          return;
                                        }
                                        onChange(v);
                                        setIsOpen(false);
                                      }}
                                    >
                                      <div
                                        className={cn(
                                          "flex flex-row justify-center relative z-[2]",
                                          highlightPseudoClass
                                        )}
                                      >
                                        {v.getDate()}
                                      </div>
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      <Flex className="justify-end gap-x-4 mt-2 px-2">
                        <Flex className="text-gray-10 gap-x-1 items-center">
                          <div className="w-[8px] h-[8px] border-[1px] border-blue-10 rounded-[999px]" />
                          <Text size="1">Today</Text>
                        </Flex>
                        <Flex className="text-gray-10 gap-x-1 items-center">
                          <div className="w-[8px] h-[8px] bg-blue-4 rounded-[999px]" />
                          <Text size="1">Selected</Text>
                        </Flex>
                      </Flex>
                    </div>
                  ) : view === "month" ? (
                    <Grid columns={"4"} gap={"2"} className="w-[344px]">
                      {Object.entries(monthValMap).map(([key, value]) => {
                        const anchorDate = new Date(
                          currentSelectedYear,
                          value,
                          1
                        );
                        return (
                          <Button
                            variant="ghost"
                            key={key}
                            className={cn(
                              "group cursor-pointer border-[1px] border-solid border-gray-6 p-1 m-0"
                            )}
                            onClick={() => {
                              navigation.setDate(anchorDate);
                              setView("default");
                            }}
                          >
                            <p
                              className={cn(
                                "text-gray-11 group-hover:text-gray-12 transition-all ease-in-out"
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
                                new Date(year, currentSelectedMonth, 1)
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
          </div>
        )}
      </Popover.Content>
    </Popover.Root>
  );
}

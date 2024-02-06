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
  Months,
} from "@/utils/date";
import { Text, Flex, Button, TextField, TextArea } from "@radix-ui/themes";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/app/AuthContext";
import { useRec } from "@/hooks/useRec";
import {
  CalendarIcon,
  Link2Icon,
  Pencil1Icon,
  PersonIcon,
  SewingPinIcon,
} from "@radix-ui/react-icons";
import { forwardRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Rec } from "@/types/rec";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import * as Select from "@radix-ui/react-select";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@radix-ui/react-icons";

const RecFormSchema = z.object({
  link: z.string().url(),
  title: z.string(),
  author: z.string(),
  description: z.string(),
  year: z
    .number()
    .int()
    .max(new Date().getUTCFullYear())
    .transform((val) => val.toString()),
  month: z
    .number()
    .min(0)
    .max(11)
    .transform((idx) => Months[idx])
    .optional(),
});

function RecForm(props: {
  setIsRecFormOpen: (open: boolean) => void;
  currentRec: Rec | null;
}) {
  const { setIsRecFormOpen, currentRec } = props;

  const { register, watch, handleSubmit, formState, getValues, control } =
    useForm({
      resolver: zodResolver(RecFormSchema),
      defaultValues: {
        link: currentRec?.link,
        title: currentRec?.title,
        author: currentRec?.author,
        description: currentRec?.description,
        year:
          currentRec?.year && !Number.isNaN(parseInt(currentRec.year))
            ? parseInt(currentRec.year)
            : undefined,
        month: currentRec?.month ? Months.indexOf(currentRec.month) : undefined,
      },
      mode: "onBlur",
    });

  console.log(watch("month"));
  console.log(formState.errors);

  return (
    <motion.div
      key="rec-form"
      className={cn("flex", "flex-col", "gap-y-3", "sticky", "top-[80px]")}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.2,
      }}
    >
      <div
        className="flex flex-row gap-x-1 py-1 items-center text-accent-11 cursor-pointer"
        onClick={() => {
          setIsRecFormOpen(false);
        }}
      >
        <ChevronLeft width="16" height="16" />
        Back
      </div>
      <Text size="2" className="text-gray-11 p-1" weight="medium">
        {`Anything interesting this week?`}
      </Text>
      <form className="flex flex-col gap-y-[10px]">
        <div>
          <TextField.Root>
            <TextField.Slot>
              <Link2Icon width="16" height="16" />
            </TextField.Slot>
            <TextField.Input
              placeholder="Link to paper"
              className="w-full"
              autoFocus
              {...register("link", { required: true })}
            />
          </TextField.Root>
          {formState.errors.link ? (
            <Text size="1" color="red">
              {formState.errors.link.message}
            </Text>
          ) : null}
        </div>
        <div>
          <TextField.Root>
            <TextField.Slot>
              <SewingPinIcon width="16" height="16" />
            </TextField.Slot>
            <TextField.Input
              placeholder="Title"
              className="w-full"
              {...register("title", { required: true })}
            />
          </TextField.Root>
        </div>
        <div>
          <TextField.Root>
            <TextField.Slot>
              <PersonIcon width="16" height="16" />
            </TextField.Slot>
            <TextField.Input
              placeholder="Author(s)"
              className="w-full"
              {...register("author", { required: true })}
            />
          </TextField.Root>
        </div>
        <Flex className="gap-x-[10px]">
          <div className="w-[40%]">
            <TextField.Root>
              <TextField.Slot>
                <CalendarIcon width="16" height="16" />
              </TextField.Slot>
              <TextField.Input
                placeholder="Year"
                className="w-full"
                {...register("year", { required: true })}
              />
            </TextField.Root>
          </div>
          <div className="min-w-[50%] w-[60%]">
            <Controller
              control={control}
              name="month"
              render={({ field }) => {
                return (
                  <Select.Root
                    key={watch("month")}
                    value={field.value ? `${field.value}` : undefined}
                    onValueChange={(value) => {
                      if (value === "empty") {
                        field.onChange(undefined);
                      } else {
                        field.onChange(value);
                      }
                    }}
                  >
                    <Select.Trigger
                      className={cn(
                        "inline-flex items-center justify-start h-[32px] bg-white outline-none border-[1px] rounded-2 border-gray-6 text-[14px] leading-[14px] px-2",
                        "data-[placeholder]:text-gray-9",
                        "w-full",
                        "relative",
                        "placeholder:text-gray-2 text-gray-12"
                      )}
                      aria-label="Food"
                    >
                      <Select.Icon className="pr-2">
                        <CalendarIcon width="16" height="16" />
                      </Select.Icon>
                      <Select.Value
                        placeholder="Month(optional)"
                        className="h-fi"
                      />
                      <Select.Icon className="pl-2 absolute right-2">
                        <ChevronDownIcon />
                      </Select.Icon>
                    </Select.Trigger>

                    <Select.Portal>
                      <Select.Content
                        className={cn(
                          "overflow-hidden bg-white rounded-[8px] border-[1px] border-gray-6",
                          "shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]"
                        )}
                      >
                        <Select.ScrollUpButton className="flex items-center justify-center h-[25px] bg-white text-blue-10 cursor-default">
                          <ChevronUpIcon />
                        </Select.ScrollUpButton>
                        <Select.Viewport className="p-1">
                          <SelectItem value={`empty`}>Select...</SelectItem>
                          {Months.map((month, idx) => {
                            return (
                              <SelectItem key={idx} value={`${idx}`}>
                                {month}
                              </SelectItem>
                            );
                          })}
                        </Select.Viewport>
                        <Select.ScrollDownButton className="flex items-center justify-center h-[25px] bg-white text-blue-10 cursor-default">
                          <ChevronDownIcon />
                        </Select.ScrollDownButton>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                );
              }}
            />
          </div>
        </Flex>
        <div>
          <TextArea
            placeholder="tl;dr"
            className="min-h-[180px] border-[1px] border-gray-6"
            autoFocus={false}
            {...register("description", { required: true })}
          />
        </div>
      </form>
    </motion.div>
  );
}

const SelectItem = forwardRef<HTMLDivElement, Select.SelectItemProps>(
  ({ children, className, ...props }, forwardedRef) => {
    return (
      <Select.Item
        className={cn(
          "text-[14px] text-gray-9 rounded-[3px] flex items-center relative select-none py-1",
          "data-[highlighted]:outline-none data-[highlighted]:bg-blue-9 data-[highlighted]:text-blue-2",
          "pl-[25px]",
          className
        )}
        {...props}
        ref={forwardedRef}
      >
        <Select.ItemText>{children}</Select.ItemText>
        <Select.ItemIndicator className="absolute left-0 w-[25px] inline-flex items-center justify-center">
          <CheckIcon />
        </Select.ItemIndicator>
      </Select.Item>
    );
  }
);
SelectItem.displayName = "SelectItem";

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
  const [isRecFormOpen, setIsRecFormOpen] = useState(false);

  if (!user) {
    // his should never happen, since the user should be authenticated to be here
    // just for narrowing the type
    return null;
  }

  return (
    <div
      className={cn(
        {
          "w-[17%]": !isRecFormOpen,
          "w-[350px]": isRecFormOpen,
        },
        "min-w-[250px]",
        `min-h-[90svh]`,
        "border-r-[1px]",
        "border-gray-6",
        "p-4",
        "transition-all",
        "duration-200",
        "ease-in-out"
      )}
    >
      <AnimatePresence mode="wait">
        {isRecFormOpen ? (
          <RecForm setIsRecFormOpen={setIsRecFormOpen} currentRec={rec} />
        ) : (
          <motion.div
            key="left-panel"
            className={cn(
              "flex",
              "flex-col",
              "gap-y-3",
              "sticky",
              "top-[80px]"
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.2,
            }}
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
                <Button
                  size={{
                    initial: "2",
                    lg: "3",
                  }}
                  className="w-full"
                  onClick={() => {
                    setIsRecFormOpen(true);
                  }}
                >
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

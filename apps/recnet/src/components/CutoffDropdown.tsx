"use client";

import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import * as Select from "@radix-ui/react-select";
import { Text } from "@radix-ui/themes";
import { CheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { forwardRef } from "react";

import { cn } from "@recnet/recnet-web/utils/cn";

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

export function CutoffDropdown(props: {
  currentCutoff: Date;
  cutoffs: Date[];
}) {
  const { currentCutoff, cutoffs } = props;
  const router = useRouter();
  // use timestamp's string as default value and select value
  const defaultValue = currentCutoff.getTime().toString();

  const tsToDateString = (tsString: string): string => {
    const ts = parseInt(tsString);
    const date = new Date(ts);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}/${year}`;
  };

  return (
    <Select.Root
      value={defaultValue}
      onValueChange={(value) => {
        const dateString = tsToDateString(value);
        router.push(`/feeds?date=${dateString}`);
      }}
    >
      <Select.Trigger
        className={cn(
          "inline-flex items-center justify-end h-[32px] light:bg-white dark:bg-slate-1 outline-none text-[14px] leading-[14px] px-2",
          "data-[placeholder]:text-gray-9",
          "w-fit",
          "text-gray-9"
        )}
        aria-label="Food"
      >
        <Select.Value className="w-fit" asChild>
          <Text>{`Cutoff: ${tsToDateString(defaultValue)}`}</Text>
        </Select.Value>
        <Select.Icon className="px-2">
          <ChevronDownIcon />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          className={cn(
            "overflow-hidden light:bg-white dark:bg-slate-2 rounded-[8px] border-[1px] border-gray-6 py-2",
            "shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]"
          )}
        >
          <Select.ScrollUpButton className="flex items-center justify-center h-[25px] bg-white text-blue-10 cursor-default">
            <ChevronUpIcon />
          </Select.ScrollUpButton>
          <Select.Viewport className="p-1">
            {cutoffs.map((cutoff, idx) => {
              const val = cutoff.getTime().toString();
              const dateString = tsToDateString(val);
              return (
                <SelectItem key={idx} value={val}>
                  {dateString}
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
}

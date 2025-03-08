"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Link2Icon,
  PersonIcon,
  QuestionMarkCircledIcon,
} from "@radix-ui/react-icons";
import * as Select from "@radix-ui/react-select";
import {
  Button,
  Checkbox,
  Flex,
  Text,
  TextArea,
  TextField,
  Tooltip,
} from "@radix-ui/themes";
import { forwardRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { trpc } from "@recnet/recnet-web/app/_trpc/client";
import { cn } from "@recnet/recnet-web/utils/cn";

import { monthToNum, numToMonth, Months, Month } from "@recnet/recnet-date-fns";

import {
  Article,
  patchArticlesAdminRequestSchema,
} from "@recnet/recnet-api-model";

import { AdminSectionBox } from "../../AdminSections";

export function ArticleManagementForm({
  currentArticle,
  onSubmitFinish,
  onCancel,
}: {
  currentArticle: Partial<Article>;
  onSubmitFinish?: () => void;
  onCancel?: () => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    getValues,
    reset,
    formState: { errors },
  } = useForm<Article>({
    resolver: zodResolver(patchArticlesAdminRequestSchema),
    defaultValues: { ...currentArticle, month: currentArticle.month ?? null },
    mode: "onTouched",
  });

  const updateArticleMutation = trpc.updateArticleById.useMutation({
    onSuccess: () => {
      toast.success("Article updated successfully!");
      onSubmitFinish?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: Article) => {
    updateArticleMutation.mutate(data);
  };

  // simulate
  const onDelete = () => {
    toast.error(`Simulate: Deleted article with link=${currentArticle.link}`);
    onSubmitFinish?.();
  };

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

  return (
    <div className="w-full flex flex-col gap-y-4">
      <AdminSectionBox>
        <Text size="2" weight="medium" className="text-gray-11">
          {`This form allows you to update the article's details below, including the article URL.`}
        </Text>
      </AdminSectionBox>

      <form className="flex flex-col gap-y-4" onSubmit={handleSubmit(onSubmit)}>
        <input type="hidden" {...register("id")} />
        {/* Article URL */}
        <div className="flex flex-col gap-y-1">
          <TextField.Root className="w-full" {...register("link")}>
            <TextField.Slot>
              <Link2Icon width="16" height="16" />
            </TextField.Slot>
          </TextField.Root>
          {errors.link && (
            <Text size="1" color="red">
              {errors.link.message}
            </Text>
          )}
        </div>

        {/* Title */}
        <div className="flex flex-col gap-y-1">
          <TextField.Root className="w-full" {...register("title")} />
          {errors.title && (
            <Text size="1" color="red">
              {errors.title.message}
            </Text>
          )}
        </div>

        {/* Author */}
        <div className="flex flex-col gap-y-1">
          <Flex align="center" className="gap-x-2">
            <PersonIcon width="16" height="16" />
            <Text size="2">Author</Text>
          </Flex>
          <TextField.Root className="w-full" {...register("author")} />
        </div>

        {/* Year / Month */}
        <Flex gap="2" className="items-center">
          {/* Year */}
          <div className="flex flex-col gap-y-1 w-1/2">
            <Flex align="center" className="gap-x-2">
              <CalendarIcon width="16" height="16" />
              <Text size="2">Year</Text>
            </Flex>
            <TextField.Root
              type="number"
              className="w-full"
              {...register("year", { valueAsNumber: true })}
            />
            {errors.year && (
              <Text size="1" color="red">
                {errors.year.message}
              </Text>
            )}
          </div>

          {/* Month */}
          <div className="flex flex-col gap-y-1 w-1/2">
            <Text size="2">Month (optional)</Text>
            <Controller
              control={control}
              name="month"
              render={({ field }) => {
                const monthValue = getValues("month");
                return (
                  <Select.Root
                    key={watch("month")}
                    value={
                      field.value !== null && field.value !== undefined
                        ? numToMonth[field.value as keyof typeof numToMonth]
                        : undefined
                    }
                    onValueChange={(value) => {
                      if (value === "empty") {
                        field.onChange(null);
                      } else {
                        field.onChange(monthToNum[value as Month]);
                      }
                    }}
                  >
                    <Select.Trigger
                      className={cn(
                        "inline-flex items-center justify-start h-[32px] bg-white dark:bg-slate-1 outline-none border-[1px] rounded-2 border-gray-7 text-[14px] leading-[14px] px-2",
                        "data-[placeholder]:text-gray-9 dark:data-[placeholder]:text-gray-10",
                        "w-full focus:border-blue-8 focus:ring-1 focus:ring-blue-8",
                        "relative",
                        "placeholder:text-gray-2",
                        "data-[disabled]:bg-[#F2F2F5] dark:data-[disabled]:bg-[#202123] data-[disabled]:cursor-not-allowed data-[disabled]:text-gray-10 dark:data-[disabled]:text-gray-11"
                      )}
                      aria-label="Food"
                    >
                      <Select.Icon className="pr-2 text-gray-10 dark:text-gray-11">
                        <CalendarIcon width="16" height="16" />
                      </Select.Icon>
                      <Select.Value
                        placeholder="Month(optional)"
                        className="h-fit"
                      />
                      <Select.Icon className="pl-2 absolute right-2">
                        <ChevronDownIcon />
                      </Select.Icon>
                    </Select.Trigger>

                    <Select.Portal>
                      <Select.Content
                        className={cn(
                          "overflow-hidden bg-white dark:bg-slate-2 rounded-[8px] border-[1px] border-gray-6",
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
                              <SelectItem key={idx} value={`${Months[idx]}`}>
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
            {errors.month && (
              <Text size="1" color="red">
                {errors.month.message}
              </Text>
            )}
          </div>
        </Flex>

        {/* DOI */}
        <div className="flex flex-col gap-y-1">
          <Text size="2">DOI (optional)</Text>
          <TextField.Root
            className="w-full"
            {...register("doi", {
              setValueAs: (value) => {
                if (value === "") {
                  return null;
                }
                return value;
              },
            })}
          />
        </div>

        {/* Abstract */}
        <div className="flex flex-col gap-y-1">
          <Text size="2">Abstract (optional)</Text>
          <TextArea
            className="min-h-[100px]"
            {...register("abstract", {
              setValueAs: (value) => {
                if (value === "") {
                  return null;
                }
                return value;
              },
            })}
          />
        </div>

        {/* isVerified */}
        <div>
          <Controller
            name="isVerified"
            control={control}
            render={({ field }) => (
              <Flex gap="2" align="center">
                <Checkbox
                  checked={!!field.value}
                  onCheckedChange={(checked) => field.onChange(!!checked)}
                />
                <Text size="2">Is Verified?</Text>
                <Tooltip content="Check if the article has been verified.">
                  <QuestionMarkCircledIcon className="text-gray-10" />
                </Tooltip>
              </Flex>
            )}
          />
        </div>

        {/* Actions: Delete / Save / Cancel */}
        <Flex gap="2" justify="end">
          <Button
            variant="outline"
            color="red"
            onClick={onDelete}
            disabled={true}
          >
            Delete
          </Button>

          {onCancel && (
            <Button variant="outline" color="gray" onClick={onCancel}>
              Cancel
            </Button>
          )}

          <Button type="submit" variant="outline" color="blue">
            {updateArticleMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </Flex>
      </form>
    </div>
  );
}

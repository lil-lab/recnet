"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarIcon,
  Link2Icon,
  PersonIcon,
  SewingPinIcon,
} from "@radix-ui/react-icons";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@radix-ui/react-icons";
import * as Select from "@radix-ui/react-select";
import { Text, Flex, Button, TextField, TextArea } from "@radix-ui/themes";
import { forwardRef, useState } from "react";
import { useForm, Controller, useFormState } from "react-hook-form";
import { TailSpin } from "react-loader-spinner";
import { toast } from "sonner";
import * as z from "zod";

import { trpc } from "@recnet/recnet-web/app/_trpc/client";
import { cn } from "@recnet/recnet-web/utils/cn";

import { Rec } from "@recnet/recnet-api-model";

import {
  getNextCutOff,
  getVerboseDateString,
  Month,
  Months,
  monthToNum,
  numToMonth,
} from "@recnet/recnet-date-fns";

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

const RecFormSchema = z.object({
  link: z.string().url(),
  title: z.string().min(1, "Title cannot be blank"),
  author: z.string().min(1, "Author(s) cannot be blank"),
  description: z
    .string()
    .max(280, "Description should be less than 280 chars")
    .min(1, "Description cannot be blank"),
  year: z.coerce
    .number()
    .refine((val) => {
      return val <= new Date().getUTCFullYear();
    }, "Year should be less than or equal to the current year")
    .refine((val) => {
      return val >= 0;
    }, "Year should be a positive number"),
  month: z.coerce.number().optional(),
});

export function RecForm(props: {
  onFinish?: () => void;
  currentRec: Rec | null;
  onUpdateSuccess?: () => void;
  onDeleteSuccess?: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    onFinish = () => {},
    currentRec,
    onUpdateSuccess = () => {},
    onDeleteSuccess = () => {},
  } = props;

  const { register, watch, handleSubmit, formState, getValues, control } =
    useForm({
      resolver: zodResolver(RecFormSchema),
      defaultValues: {
        link: currentRec?.article?.link,
        title: currentRec?.article?.title,
        author: currentRec?.article?.author,
        description: currentRec?.description,
        year: currentRec?.article?.year,
        month: currentRec?.article?.month,
      },
      mode: "onBlur",
    });
  const { isDirty } = useFormState({ control });

  const insertRecMutation = trpc.addUpcomingRec.useMutation();
  const editRecMutation = trpc.editUpcomingRec.useMutation();
  const deleteRecMutation = trpc.deleteUpcomingRec.useMutation();
  const utils = trpc.useUtils();

  return (
    <form
      className="flex flex-col gap-y-[10px]"
      onSubmit={handleSubmit(async (data, e) => {
        setIsSubmitting(true);
        e?.preventDefault();
        // parse using zod schema
        const res = RecFormSchema.safeParse(data);
        if (!res.success) {
          // should not happen, just in case and for typescript to narrow down type
          console.error("Invalid form data.");
          setIsSubmitting(false);
          return;
        }
        if (!isDirty) {
          onFinish();
          setIsSubmitting(false);
          return;
        }
        try {
          // if currentRec exists, update, else insert new rec
          if (currentRec) {
            await editRecMutation.mutateAsync({
              data: res.data,
              id: currentRec.id,
            });
            toast.success("Rec updated successfully.");
          } else {
            await insertRecMutation.mutateAsync(res.data);
            toast.success("We got your rec! 🎉");
          }
          onUpdateSuccess();
          await utils.getUpcomingRec.invalidate();
          onFinish();
          setIsSubmitting(false);
        } catch (error) {
          console.error(error);
          toast.error("Failed to update/insert new rec.");
          setIsSubmitting(false);
        }
      })}
    >
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
        {formState.errors.title ? (
          <Text size="1" color="red">
            {formState.errors.title.message}
          </Text>
        ) : null}
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
        {formState.errors.author ? (
          <Text size="1" color="red">
            {formState.errors.author.message}
          </Text>
        ) : null}
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
          {formState.errors.year ? (
            <Text size="1" color="red">
              {formState.errors.year.message}
            </Text>
          ) : null}
        </div>
        <div className="min-w-[50%] w-[60%]">
          <Controller
            control={control}
            name="month"
            render={({ field }) => {
              const monthValue = getValues("month");
              return (
                <Select.Root
                  key={watch("month")}
                  value={monthValue ? numToMonth[monthValue] : undefined}
                  onValueChange={(value) => {
                    if (value === "empty") {
                      field.onChange(undefined);
                    } else {
                      field.onChange(monthToNum[value as Month]);
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
        </div>
      </Flex>
      <div>
        <TextArea
          placeholder="tl;dr"
          className="min-h-[180px] border-[1px] border-gray-6"
          autoFocus={false}
          {...register("description", { required: true })}
        />
        <div className="w-full flex flex-row justify-between mt-1">
          {formState.errors.description ? (
            <Text size="1" color="red">
              {formState.errors.description.message}
            </Text>
          ) : (
            <div />
          )}
          <Text size="1" className="text-gray-11">
            {`${watch("description")?.length ?? 0}/280`}
          </Text>
        </div>
      </div>
      <Text size="1" weight="medium" className="text-gray-9 p-1">
        {`You can edit at anytime before this week's cutoff: ${getVerboseDateString(getNextCutOff())}.`}
      </Text>
      <Button
        variant="solid"
        color="blue"
        className={cn("bg-blue-10", "cursor-pointer")}
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <TailSpin
            radius={"1"}
            visible={true}
            height="20"
            width="20"
            color={"#ffffff"}
            ariaLabel="line-wave-loading"
            wrapperClass="w-fit h-fit"
          />
        ) : (
          "Submit"
        )}
      </Button>
      {currentRec ? (
        <Button
          variant="outline"
          color="red"
          className="cursor-pointer"
          onClick={async () => {
            try {
              await deleteRecMutation.mutateAsync({
                id: currentRec.id,
              });
              await onDeleteSuccess();
              await utils.getUpcomingRec.invalidate();
              toast.success("Rec deleted successfully");
              onFinish();
            } catch (error) {
              console.error(error);
              toast.error("Failed to delete rec.");
              return;
            }
          }}
        >
          Delete
        </Button>
      ) : null}
    </form>
  );
}

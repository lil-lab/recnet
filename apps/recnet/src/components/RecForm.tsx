"use client";

import { cn } from "@recnet/recnet-web/utils/cn";
import {
  getNextCutOff,
  getVerboseDateString,
  Months,
} from "@recnet/recnet-web/utils/date";
import { Text, Flex, Button, TextField, TextArea } from "@radix-ui/themes";
import {
  CalendarIcon,
  Link2Icon,
  PersonIcon,
  SewingPinIcon,
} from "@radix-ui/react-icons";
import { forwardRef, useState } from "react";
import { Rec } from "@recnet/recnet-web/types/rec";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import * as Select from "@radix-ui/react-select";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@radix-ui/react-icons";
import { toast } from "sonner";
import { insertRec, updateRec, deleteRec } from "@recnet/recnet-web/server/rec";
import { User } from "@recnet/recnet-web/types/user";
import { TailSpin } from "react-loader-spinner";

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
    .string()
    .refine((val) => !Number.isNaN(parseInt(val)), "Year should be a number")
    .refine((val) => {
      const year = parseInt(val);
      return year <= new Date().getUTCFullYear();
    }, "Year should be less than or equal to the current year")
    .refine((val) => {
      const year = parseInt(val);
      return year >= 0;
    }, "Year should be a positive number"),
  month: z.coerce.string().optional(),
});

export function RecForm(props: {
  onFinish?: () => void;
  currentRec: Rec | null;
  user: User;
  onUpdateSuccess?: () => void;
  onDeleteSuccess?: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    onFinish = () => {},
    currentRec,
    user,
    onUpdateSuccess = () => {},
    onDeleteSuccess = () => {},
  } = props;

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
        month: currentRec?.month,
      },
      mode: "onBlur",
    });

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
        // if no changes, close dialog
        if (
          currentRec &&
          (
            ["link", "title", "author", "year", "month", "description"] as const
          ).every((key) => {
            return res.data[key] === currentRec[key];
          })
        ) {
          onFinish();
          setIsSubmitting(false);
          return;
        }
        try {
          // if currentRec exists, update, else insert new rec
          if (currentRec) {
            // update
            // await updateRec(res.data, currentRec.id);
            await updateRec(currentRec.id, res.data);
            toast.success("Rec updated successfully.");
          } else {
            // insert
            // await insertRec(res.data);
            await insertRec(res.data, user);
            toast.success("We got your rec! 🎉");
          }
          onUpdateSuccess();
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
              return (
                <Select.Root
                  key={watch("month")}
                  value={getValues("month")}
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
              await deleteRec(currentRec.id, user.id);
              await onDeleteSuccess();
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
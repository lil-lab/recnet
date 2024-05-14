"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Flex,
  Text,
  TextField,
  Dialog,
  Checkbox,
} from "@radix-ui/themes";
import { useForm, useFormState, Controller } from "react-hook-form";
import { z } from "zod";

import { AnnouncementCard } from "@recnet/recnet-web/components/AnnouncementCard";
import { cn } from "@recnet/recnet-web/utils/cn";

import { WeekTs, getVerboseDateString } from "@recnet/recnet-date-fns";

import { Announcement } from "@recnet/recnet-api-model";

import { AdminSectionBox } from "../../AdminSections";

const announcementFormSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(1000),
  allowClose: z.boolean(),
  startAt: z.date(),
  endAt: z.date(),
});

interface AnnouncementFormProps {
  mode: "create" | "update";
  prefilledData?: Announcement;
}

export function AnnouncementForm(props: AnnouncementFormProps) {
  const { mode, prefilledData = null } = props;
  const isCreateMode = mode === "create";
  const today = new Date();

  const { register, handleSubmit, formState, setError, control, watch } =
    useForm({
      resolver: zodResolver(announcementFormSchema),
      defaultValues: {
        title: isCreateMode
          ? "RecNet Announcement"
          : prefilledData?.title ?? "",
        content: isCreateMode ? "" : prefilledData?.content ?? "",
        allowClose: isCreateMode ? false : prefilledData?.allowClose ?? false,
        startAt: isCreateMode
          ? today
          : prefilledData?.startAt
            ? new Date(prefilledData.startAt)
            : new Date(),
        endAt: isCreateMode
          ? new Date(today.getTime() + WeekTs)
          : prefilledData?.endAt
            ? new Date(prefilledData.endAt)
            : new Date(today.getTime() + WeekTs),
      },
      mode: "onTouched",
    });
  const { isDirty } = useFormState({ control: control });

  console.log(watch());

  return (
    <div className={cn("w-full h-fit", "flex flex-col", "gap-y-2")}>
      <AnnouncementCard
        title={watch("title")}
        content={watch("content")}
        allowClose={watch("allowClose")}
        id={`announcement-${mode}-preview`}
        isPreview
      />
      <AdminSectionBox>
        <Flex
          direction={{
            initial: "column",
            sm: "row",
          }}
          className="w-full h-full gap-4 flex-wrap"
        >
          <div className="flex flex-col gap-y-2 w-full">
            <Text size="1" className="text-gray-10">
              Title
            </Text>
            <TextField.Root {...register("title")} />
            {formState.errors.title ? (
              <Text size="1" color="red">
                {formState.errors.title.message}
              </Text>
            ) : null}
          </div>
          <div className="flex flex-col gap-y-2 w-full">
            <Text size="1" className="text-gray-10">
              Content
            </Text>
            <TextField.Root {...register("content")} />
            {formState.errors.content ? (
              <Text size="1" color="red">
                {formState.errors.content.message}
              </Text>
            ) : null}
          </div>
          <div className="flex flex-col gap-y-2 w-[48%]">
            <Text size="1" className="text-gray-10">
              Start At
            </Text>
            <Controller
              name="startAt"
              control={control}
              render={({ field }) => (
                <Flex gap="2" className="items-center text-gray-12 w-full">
                  <TextField.Root
                    value={getVerboseDateString(field.value)}
                    className="w-full"
                    readOnly
                  />
                </Flex>
              )}
            />
            {formState.errors.startAt ? (
              <Text size="1" color="red">
                {formState.errors.startAt.message}
              </Text>
            ) : null}
          </div>
          <div className="flex flex-col gap-y-2 w-[48%]">
            <Text size="1" className="text-gray-10">
              End At
            </Text>
            <Controller
              name="endAt"
              control={control}
              render={({ field }) => (
                <Flex gap="2" className="items-center text-gray-12 w-full">
                  <TextField.Root
                    value={getVerboseDateString(field.value)}
                    className="w-full"
                    readOnly
                  />
                </Flex>
              )}
            />
            {formState.errors.endAt ? (
              <Text size="1" color="red">
                {formState.errors.endAt.message}
              </Text>
            ) : null}
          </div>

          <div className="flex flex-col gap-y-2 w-full">
            <Controller
              name="allowClose"
              control={control}
              render={({ field }) => (
                <Flex gap="2" className="items-center text-gray-12">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                    }}
                  />
                  <Text size="2">Allow Close</Text>
                </Flex>
              )}
            />
            {formState.errors.allowClose ? (
              <Text size="1" color="red">
                {formState.errors.allowClose.message}
              </Text>
            ) : null}
          </div>
        </Flex>
      </AdminSectionBox>
    </div>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Flex, Text, TextField, Checkbox } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useFormState, Controller } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { trpc } from "@recnet/recnet-web/app/_trpc/client";
import { AnnouncementCard } from "@recnet/recnet-web/components/AnnouncementCard";
import { DatePicker } from "@recnet/recnet-web/components/DatePicker";
import { DoubleConfirmButton } from "@recnet/recnet-web/components/DoubleConfirmButton";
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

type AnnouncementFormProps =
  | {
      mode: "update";
      prefilledData: Announcement;
    }
  | {
      mode: "create";
    };

export function AnnouncementForm(props: AnnouncementFormProps) {
  const { mode } = props;
  const isCreateMode = mode === "create";
  const prefilledData = !isCreateMode ? props.prefilledData : null;
  const today = new Date();
  const router = useRouter();
  const utils = trpc.useUtils();

  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const { isDirty, dirtyFields } = useFormState({ control: control });

  const createAnnouncementMutation = trpc.createAnnouncement.useMutation();
  const updateAnnouncementMutation = trpc.updateAnnouncement.useMutation();

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
        <form
          className="flex flex-col w-full"
          onSubmit={handleSubmit(async (data, e) => {
            e?.preventDefault();
            setIsSubmitting(true);
            // if endAt is before startAt, return an error
            if (data.endAt < data.startAt) {
              setError("endAt", {
                type: "manual",
                message: "End date must be after start date",
              });
              setIsSubmitting(false);
              return;
            }
            const startAt = data.startAt.toISOString();
            const endAt = data.endAt.toISOString();
            try {
              if (!isCreateMode && prefilledData) {
                // only send dirty fields
                const dirtyData = Object.fromEntries(
                  Object.entries(dirtyFields).map(([key, value]) => [
                    key,
                    key === "startAt" || key === "endAt"
                      ? (data[key as keyof typeof data] as Date).toISOString()
                      : data[key as keyof typeof data],
                  ])
                );
                await updateAnnouncementMutation.mutateAsync({
                  id: prefilledData.id,
                  ...dirtyData,
                });
              } else if (isCreateMode) {
                await createAnnouncementMutation.mutateAsync({
                  title: data.title,
                  content: data.content,
                  allowClose: data.allowClose,
                  startAt,
                  endAt,
                  isActivated: true,
                });
              }
              utils.getLatestAnnouncement.invalidate();
              toast.success(
                `${mode === "create" ? "Created" : "Updated"} announcement successfully. 🎉`
              );
              router.refresh();
            } catch (e) {
              console.log(e);
              toast.error(`Failed to ${mode} announcement. Contact support.`);
            }

            setIsSubmitting(false);
          })}
        >
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
            <div className="flex flex-col gap-y-2 w-full md:w-[48%]">
              <Text size="1" className="text-gray-10">
                Start At
              </Text>
              <Controller
                name="startAt"
                control={control}
                render={({ field }) => (
                  <Flex gap="2" className="items-center text-gray-12 w-full">
                    <DatePicker
                      value={field.value}
                      onChange={(date) => {
                        field.onChange(date);
                      }}
                      renderTrigger={() => {
                        return (
                          <TextField.Root
                            value={getVerboseDateString(field.value, {
                              year: "numeric",
                            })}
                            className="w-full cursor-pointer"
                            readOnly
                          />
                        );
                      }}
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
            <div className="flex flex-col gap-y-2 w-full md:w-[48%]">
              <Text size="1" className="text-gray-10">
                End At
              </Text>
              <Controller
                name="endAt"
                control={control}
                render={({ field }) => (
                  <Flex gap="2" className="items-center text-gray-12 w-full">
                    <DatePicker
                      value={field.value}
                      onChange={(date) => {
                        field.onChange(date);
                      }}
                      renderTrigger={() => {
                        return (
                          <TextField.Root
                            value={getVerboseDateString(field.value, {
                              year: "numeric",
                            })}
                            className="w-full cursor-pointer"
                            readOnly
                          />
                        );
                      }}
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
            <div className="flex flex-col gap-y-2 w-full py-2">
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
          <Flex className="justify-end w-full gap-x-2">
            {!isCreateMode ? (
              <DoubleConfirmButton
                title="Confirm Delete Announcement"
                description="Are you sure you want to delete this announcement? This action cannot be undone."
                onConfirm={async () => {
                  const targetId = prefilledData?.id;
                  if (!targetId) {
                    toast.error("Failed to delete announcement.");
                    return;
                  }
                  setIsSubmitting(true);
                  try {
                    await updateAnnouncementMutation.mutateAsync({
                      id: targetId,
                      isActivated: false,
                    });
                    utils.getLatestAnnouncement.invalidate();
                    toast.success(`Delete announcement successfully.`);
                  } catch (e) {
                    console.log(e);
                    toast.error("Failed to delete announcement.");
                  }
                  setIsSubmitting(false);
                }}
              >
                <Button variant="outline" color="red" loading={isSubmitting}>
                  Delete
                </Button>
              </DoubleConfirmButton>
            ) : null}

            <Button
              type="submit"
              className={cn("bg-blue-10", "cursor-pointer")}
              loading={isSubmitting}
              disabled={!isDirty}
            >
              {isCreateMode ? "Create" : "Update"}
            </Button>
          </Flex>
        </form>
      </AdminSectionBox>
    </div>
  );
}

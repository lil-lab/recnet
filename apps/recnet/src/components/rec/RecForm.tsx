import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarIcon,
  Link2Icon,
  PersonIcon,
  SewingPinIcon,
} from "@radix-ui/react-icons";
import { Text, Flex, Button, TextField, TextArea } from "@radix-ui/themes";
import { useState } from "react";
import { useForm, useFormState } from "react-hook-form";
import { TailSpin } from "react-loader-spinner";
import { toast } from "sonner";
import { z } from "zod";

import { trpc } from "@recnet/recnet-web/app/_trpc/client";
import { RecArticleForm } from "@recnet/recnet-web/components/rec/RecArticleForm";
import { cn } from "@recnet/recnet-web/utils/cn";

import {
  getNextCutOff,
  getVerboseDateString,
  numToMonth,
} from "@recnet/recnet-date-fns";

import { Rec } from "@recnet/recnet-api-model";

const RecFormSchema = z.object({
  description: z
    .string()
    .max(280, "Description should be less than 280 chars")
    .min(1, "Description cannot be blank"),
});

export function RecForm(props: { onFinish?: () => void; currentRec: Rec }) {
  const { onFinish = () => {}, currentRec } = props;
  const [recNewArticle, setRecNewArticle] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, watch, handleSubmit, formState, control } = useForm({
    resolver: zodResolver(RecFormSchema),
    defaultValues: {
      description: currentRec.description,
    },
    mode: "onBlur",
  });
  const { isDirty } = useFormState({ control });

  const editRecMutation = trpc.editUpcomingRec.useMutation();
  const deleteRecMutation = trpc.deleteUpcomingRec.useMutation();
  const utils = trpc.useUtils();

  return (
    <div>
      {recNewArticle ? (
        <RecArticleForm currentRec={currentRec} onFinish={onFinish} />
      ) : (
        <div className="flex flex-col gap-y-3">
          <Flex className="w-full">
            <Text
              size="2"
              weight="medium"
              className="text-blue-11 p-1 cursor-pointer hover:underline"
              onClick={() => setRecNewArticle(true)}
            >
              Recommend another article?
            </Text>
          </Flex>
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
                await editRecMutation.mutateAsync({
                  data: {
                    // REFACTOR_AFTER_MIGRATION: use spread operator to prefill rest fields
                    articleId: currentRec.article.id,
                    doi: currentRec.article.doi ?? undefined,
                    link: currentRec.article.link,
                    title: currentRec.article.title,
                    author: currentRec.article.author,
                    year: currentRec.article.year,
                    month: currentRec.article.month ?? undefined,
                    description: res.data.description,
                  },
                  id: currentRec.id,
                });
                toast.success("Rec updated successfully.");
                await utils.getUpcomingRec.invalidate();
                onFinish();
                setIsSubmitting(false);
              } catch (error) {
                console.error(error);
                toast.error("Failed to update new rec.");
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
                  className="w-full"
                  autoFocus
                  disabled
                  value={currentRec.article.link}
                />
              </TextField.Root>
            </div>
            <div>
              <TextField.Root>
                <TextField.Slot>
                  <SewingPinIcon width="16" height="16" />
                </TextField.Slot>
                <TextField.Input
                  className="w-full"
                  value={currentRec.article.title}
                  disabled
                />
              </TextField.Root>
            </div>
            <div>
              <TextField.Root>
                <TextField.Slot>
                  <PersonIcon width="16" height="16" />
                </TextField.Slot>
                <TextField.Input
                  className="w-full"
                  value={currentRec.article.author}
                  disabled
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
                    value={currentRec.article.year}
                    disabled
                  />
                </TextField.Root>
              </div>
              <div className="min-w-[50%] w-[60%]">
                <TextField.Root>
                  <TextField.Slot>
                    <CalendarIcon width="16" height="16" />
                  </TextField.Slot>
                  <TextField.Input
                    placeholder="Month(optional)"
                    className="w-full"
                    value={
                      currentRec.article.month
                        ? numToMonth[currentRec.article.month]
                        : undefined
                    }
                    disabled
                  />
                </TextField.Root>
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
                    {`${formState.errors.description.message}`}
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
            <Button
              variant="outline"
              color="red"
              className="cursor-pointer"
              onClick={async () => {
                try {
                  await deleteRecMutation.mutateAsync({
                    id: currentRec.id,
                  });
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
          </form>
        </div>
      )}
    </div>
  );
}

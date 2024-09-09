import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarIcon,
  Link2Icon,
  PersonIcon,
  SewingPinIcon,
} from "@radix-ui/react-icons";
import { Text, Flex, Button, TextField, TextArea } from "@radix-ui/themes";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useForm, useFormState } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { trpc } from "@recnet/recnet-web/app/_trpc/client";
import { Accordion } from "@recnet/recnet-web/components/Accordion";
import { RecNetLink } from "@recnet/recnet-web/components/Link";
import { ReportEmailAccount } from "@recnet/recnet-web/components/error";
import { NewArticleForm } from "@recnet/recnet-web/components/rec/NewArticleForm";
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

/**
 * Used to edit the description of an upcoming rec.
 *
 * Only showed when user has submitted an upcoming rec.
 *
 * Redirected to `NewArticleForm` if user wants to change the article.
 */
export function RecEditForm(props: { onFinish?: () => void; currentRec: Rec }) {
  const { onFinish = () => {}, currentRec } = props;
  const [recNewArticle, setRecNewArticle] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, watch, handleSubmit, formState, control } = useForm({
    resolver: zodResolver(RecFormSchema),
    defaultValues: {
      description: currentRec.description,
    },
    mode: "onTouched",
  });
  const { isDirty } = useFormState({ control });

  const editRecMutation = trpc.editUpcomingRec.useMutation();
  const deleteRecMutation = trpc.deleteUpcomingRec.useMutation();
  const utils = trpc.useUtils();

  return (
    <AnimatePresence initial={false} mode="wait">
      {recNewArticle ? (
        <motion.div
          key="rec-article-form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <NewArticleForm currentRec={currentRec} onFinish={onFinish} />
        </motion.div>
      ) : (
        <motion.div
          key="rec-form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col gap-y-3"
        >
          <Flex direction={"column"} className="w-full">
            <Text
              size="2"
              weight="medium"
              className="text-gray-11 p-1"
              onClick={() => setRecNewArticle(true)}
            >
              You can modify at anytime before this cycle ends.
            </Text>
            <div className="flex flex-row justify-start w-full">
              <Text
                size="1"
                weight={"medium"}
                className="text-blue-11 p-1 cursor-pointer hover:underline"
                onClick={() => setRecNewArticle(true)}
              >
                {`Recommend a different paper?`}
              </Text>
            </div>
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
                  articleId: currentRec.article.id,
                  article: null,
                  description: res.data.description,
                  isSelfRec: false, // TODO: implement self rec
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
              <TextField.Root
                className="w-full"
                autoFocus
                disabled
                value={currentRec.article.link}
              >
                <TextField.Slot>
                  <Link2Icon width="16" height="16" />
                </TextField.Slot>
              </TextField.Root>
            </div>
            <div>
              <TextField.Root
                className="w-full"
                value={currentRec.article.title}
                disabled
              >
                <TextField.Slot>
                  <SewingPinIcon width="16" height="16" />
                </TextField.Slot>
              </TextField.Root>
            </div>
            <div>
              <TextField.Root
                className="w-full"
                value={currentRec.article.author}
                disabled
              >
                <TextField.Slot>
                  <PersonIcon width="16" height="16" />
                </TextField.Slot>
              </TextField.Root>
            </div>
            <Flex className="gap-x-[10px]">
              <div className="w-[40%]">
                <TextField.Root
                  placeholder="Year"
                  className="w-full"
                  value={currentRec.article.year}
                  disabled
                >
                  <TextField.Slot>
                    <CalendarIcon width="16" height="16" />
                  </TextField.Slot>
                </TextField.Root>
              </div>
              <div className="min-w-[50%] w-[60%]">
                <TextField.Root
                  placeholder="Month(optional)"
                  className="w-full"
                  value={
                    currentRec.article.month
                      ? numToMonth[currentRec.article.month]
                      : undefined
                  }
                  disabled
                >
                  <TextField.Slot>
                    <CalendarIcon width="16" height="16" />
                  </TextField.Slot>
                </TextField.Root>
              </div>
            </Flex>
            <div>
              <TextArea
                placeholder="tl;dr"
                className="min-h-[180px] border-[1px] border-gray-6"
                autoFocus
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
            <div className="flex flex-col w-full">
              <Accordion
                title="Why I can't edit the article details?"
                className="text-blue-11"
                titleClassName="text-[12px]"
              >
                <p className="text-gray-10 my-1 leading-2 text-[12px]">
                  The article details are prefilled from our database. If you
                  think the details are incorrect, please{" "}
                  <RecNetLink href={`mailto:${ReportEmailAccount}`}>
                    contact us
                  </RecNetLink>
                </p>
              </Accordion>
            </div>
            <Button
              variant="solid"
              color="blue"
              className={cn("bg-blue-10", "cursor-pointer")}
              type="submit"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              Submit
            </Button>
            <Button
              variant="outline"
              color="red"
              className="cursor-pointer"
              onClick={async () => {
                try {
                  await deleteRecMutation.mutateAsync();
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}

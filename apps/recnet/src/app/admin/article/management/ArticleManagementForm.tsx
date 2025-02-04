"use client";

import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Checkbox,
  Flex,
  Text,
  TextArea,
  TextField,
  Tooltip,
} from "@radix-ui/themes";
import { toast } from "sonner";
import {
  CalendarIcon,
  Link2Icon,
  PersonIcon,
  QuestionMarkCircledIcon,
} from "@radix-ui/react-icons";

import { AdminSectionBox } from "../../AdminSections";

import { trpc } from "@recnet/recnet-web/app/_trpc/client";
import { AdminUpdateArticleDtoSchema } from "@recnet/recnet-api-model";

type ArticleFormData = z.infer<typeof AdminUpdateArticleDtoSchema>;

export function ArticleManagementForm({
                                        currentArticle,
                                        onSubmitFinish,
                                        onCancel,
                                      }: {
  currentArticle: Partial<ArticleFormData>;
  onSubmitFinish?: () => void;
  onCancel?: () => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ArticleFormData>({
    resolver: zodResolver(AdminUpdateArticleDtoSchema),
    defaultValues: currentArticle,
    mode: "onTouched",
  });

  const updateArticleMutation = trpc.updateArticleByLink.useMutation({
    onSuccess: () => {
      toast.success("Article updated successfully!");
      onSubmitFinish?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: ArticleFormData) => {
    updateArticleMutation.mutate(data);
  };

  // simulate
  const onDelete = () => {
    toast.error(`Simulate: Deleted article with link=${currentArticle.link}`);
    onSubmitFinish?.();
  };

  return (
    <div className="w-full flex flex-col gap-y-4">
      <AdminSectionBox>
        <Text size="2" weight="medium" className="text-gray-11">
          {`This form allows you to update the article's details below, including the article URL.`}
        </Text>
      </AdminSectionBox>

      <form className="flex flex-col gap-y-4" onSubmit={handleSubmit(onSubmit)}>
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
            <Text size="2">Month (0-11, optional)</Text>
            <TextField.Root
              type="number"
              className="w-full"
              {...register("month", {
                setValueAs: (v) => {
                  if (v === "") return null;
                  const num = Number(v);
                  return Number.isInteger(num) ? num : null;
                },
              })}
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
          <TextField.Root className="w-full" {...register("doi")} />
        </div>

        {/* Abstract */}
        <div className="flex flex-col gap-y-1">
          <Text size="2">Abstract (optional)</Text>
          <TextArea className="min-h-[100px]" {...register("abstract")} />
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

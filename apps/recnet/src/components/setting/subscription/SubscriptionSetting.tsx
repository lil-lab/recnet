"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, Flex, Text, CheckboxCards, Button } from "@radix-ui/themes";
import { Slack as SlackIcon } from "lucide-react";
import { useState } from "react";
import { Controller, useForm, useFormState } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { trpc } from "@recnet/recnet-web/app/_trpc/client";
import { DoubleConfirmButton } from "@recnet/recnet-web/components/DoubleConfirmButton";
import { RecNetLink } from "@recnet/recnet-web/components/Link";
import { LoadingBox } from "@recnet/recnet-web/components/LoadingBox";
import { cn } from "@recnet/recnet-web/utils/cn";

import {
  SubscriptionChannel,
  SubscriptionType,
  subscriptionTypeSchema,
  subscriptionChannelSchema,
} from "@recnet/recnet-api-model";

const transformSubscriptionEnum = (subType: string): string => {
  return subType
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const subscriptionChannelEditSchema = z.object({
  channels: subscriptionChannelSchema.array(),
});

function SubscriptionTypeControlSection(props: {
  type: SubscriptionType;
  selectedChannels: SubscriptionChannel[];
}) {
  const { type, selectedChannels } = props;
  const title = transformSubscriptionEnum(type);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const utils = trpc.useUtils();

  const { handleSubmit, control, reset, setError, formState } = useForm({
    resolver: zodResolver(subscriptionChannelEditSchema),
    defaultValues: {
      channels: selectedChannels,
    },
    mode: "onTouched",
  });
  const { isDirty } = useFormState({ control });

  const updateSubscriptionMutation = trpc.updateSubscription.useMutation();
  const { data: slackOAuthData } = trpc.getSlackOAuthStatus.useQuery();

  return (
    <>
      <Text size="4" className="block mb-2">
        {title}
      </Text>

      <form
        onSubmit={handleSubmit(
          async (data, e) => {
            setIsSubmitting(true);
            /**
             * Special case 1: WEEKLY_DIGEST
             * For weekly digest, at least one channel must be selected
             * if no, then show error message
             */
            if (type === "WEEKLY_DIGEST" && data.channels.length === 0) {
              setError("channels", {
                type: "manual",
                message:
                  "At least one channel must be selected for Weekly Digest",
              });
              setIsSubmitting(false);
              return;
            }
            /*
             * Special case 2: SLACK distribution channel
             * When user selects slack channel, we need to check if the user has completed slack integration oauth flow or not
             * If not, then show error message and ask user to complete slack integration
             */
            if (
              slackOAuthData?.workspaceName === null &&
              data.channels.includes(subscriptionChannelSchema.enum.SLACK)
            ) {
              setError("channels", {
                type: "manual",
                message:
                  "To enable slack distribution channel, you need to complete slack integration first. See 'Slack Integration' below to learn more",
              });
              setIsSubmitting(false);
              return;
            }

            await updateSubscriptionMutation.mutateAsync({
              type,
              channels: data.channels,
            });
            utils.getSubscriptions.invalidate();
            toast.success("Subscription updated successfully");
            setIsSubmitting(false);
          },
          (e) => {
            console.log(e);
          }
        )}
      >
        <div>
          <Flex className="mb-1 text-[14px] flex-col gap-y-1">
            <Text size="1" className="block text-gray-11 mb-2 mt-1">
              Distribution Channels:
            </Text>
          </Flex>
          <Controller
            control={control}
            name="channels"
            render={({ field }) => {
              return (
                <div>
                  <CheckboxCards.Root
                    className="grid grid-cols-2 xl:grid-cols-3 py-2"
                    value={field.value}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    {subscriptionChannelSchema.options.map((channel) => {
                      return (
                        <CheckboxCards.Item key={channel} value={channel}>
                          {channel.charAt(0).toUpperCase() +
                            channel.slice(1).toLowerCase()}
                        </CheckboxCards.Item>
                      );
                    })}
                  </CheckboxCards.Root>
                  {formState.errors.channels && (
                    <Text size="1" color="red">
                      {`${formState.errors.channels.message}`}
                    </Text>
                  )}
                </div>
              );
            }}
          />
        </div>
        <Flex className="py-2 gap-x-1">
          <Button
            variant="solid"
            color="blue"
            className={cn(
              isDirty ? "bg-blue-10" : "bg-gray-8",
              "cursor-pointer"
            )}
            type="submit"
            disabled={isSubmitting || !isDirty}
            loading={isSubmitting}
          >
            Save
          </Button>
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={async () => {
              reset();
            }}
            type="reset"
          >
            Cancel
          </Button>
        </Flex>
      </form>
    </>
  );
}

export function SubscriptionSetting() {
  const { data, isFetching } = trpc.getSubscriptions.useQuery();
  const { data: slackOAuthData, isFetching: isFetchingSlackOAuthData } =
    trpc.getSlackOAuthStatus.useQuery();
  const deleteSlackOAuthInfoMutation = trpc.deleteSlackOAuthInfo.useMutation();
  const utils = trpc.useUtils();

  const workspaceName = slackOAuthData?.workspaceName ?? null;

  return (
    <div>
      <Dialog.Title>Subscription Setting</Dialog.Title>
      <Dialog.Description size="2" mb="4" className="text-gray-11">
        Customize the subscription types and channels that best fits your needs.
      </Dialog.Description>

      {isFetching ? (
        <LoadingBox />
      ) : (
        <div className="w-full">
          {subscriptionTypeSchema.options.map((subType) => {
            const subscriptionTypeObj = (data?.subscriptions ?? []).find(
              (sub) => sub.type === subType
            );
            return (
              <SubscriptionTypeControlSection
                key={subType}
                type={subType}
                selectedChannels={subscriptionTypeObj?.channels ?? []}
              />
            );
          })}
        </div>
      )}

      <Text size="4" className="block mt-4">
        Slack Integration
      </Text>
      <Text size="1" className="block text-gray-11 mb-2 mt-1">
        Install our Slack App to enable distributing subscription through Slack.
      </Text>
      {isFetchingSlackOAuthData ? (
        <LoadingBox />
      ) : workspaceName === null ? (
        <RecNetLink href="api/slack/oauth/install">
          <Button
            variant="solid"
            className="my-2 bg-[#2EB67D] dark:bg-[#4A154B] py-1 cursor-pointer"
            size="3"
          >
            <SlackIcon />
            Add our app to your workspace
          </Button>
        </RecNetLink>
      ) : (
        <div className="flex flex-row justify-between items-center pr-4">
          <Text size="2" className="text-gray-11">
            ✅ Currently installed in{" "}
            <span className="text-blue-8">{workspaceName}</span>
          </Text>
          <DoubleConfirmButton
            onConfirm={async () => {
              await deleteSlackOAuthInfoMutation.mutateAsync();
              utils.getSlackOAuthStatus.invalidate();
            }}
            title="Are you sure?"
            description={
              <div>
                {[
                  "We will disconnect and will not be able to distribute subscription through slack.",
                  "But the slack app will still be installed in your workspace.",
                  "To remove it from your workspace, follow the instructions ",
                ].map((text, index) => (
                  <Text
                    key={index}
                    size="2"
                    className="inline-block text-gray-11 mr-1"
                  >
                    {text}
                  </Text>
                ))}
                <RecNetLink
                  radixLinkProps={{
                    target: "_blank",
                  }}
                  href="https://slack.com/help/articles/360003125231-Remove-apps-and-custom-integrations-from-your-workspace"
                >
                  here
                </RecNetLink>
                .
              </div>
            }
          >
            <Button variant="ghost" className="cursor-pointer">
              <Text
                size="1"
                className="text-gray-10 hover:text-gray-11 transition-all ease-in-out"
              >
                remove?
              </Text>
            </Button>
          </DoubleConfirmButton>
        </div>
      )}
    </div>
  );
}

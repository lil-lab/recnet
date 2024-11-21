"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as Accordion from "@radix-ui/react-accordion";
import {
  Card,
  Dialog,
  Flex,
  Text,
  CheckboxCards,
  Badge,
  Button,
} from "@radix-ui/themes";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Controller, useForm, useFormState } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { trpc } from "@recnet/recnet-web/app/_trpc/client";
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

function SubscriptionTypeCard(props: {
  type: SubscriptionType;
  selectedChannels: SubscriptionChannel[];
}) {
  const { type, selectedChannels } = props;
  const title = transformSubscriptionEnum(type);
  const isActivated = selectedChannels.length > 0;
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

  return (
    <Accordion.Item value={type} className="w-full">
      <Accordion.Trigger className="w-full group">
        <Card
          className={cn(
            "w-full p-4 rounded-4 flex flex-row justify-between items-center",
            {
              "bg-blueA-4 border-blue-8 border-[1px]": isActivated,
            }
          )}
        >
          <Flex className="flex flex-col gap-y-1">
            {title}
            <Text size="1" className="text-gray-11">
              Channels:{" "}
              {selectedChannels
                .map((channel) => channel.toLowerCase())
                .join(", ")}
            </Text>
          </Flex>
          <ChevronDown
            size={16}
            className="transition-transform duration-300 ease-[cubic-bezier(0.87,_0,_0.13,_1)] group-data-[state=open]:rotate-180"
          />
        </Card>
      </Accordion.Trigger>
      <Accordion.Content asChild className="px-2 flex flex-col gap-y-2 py-4">
        <form
          onSubmit={handleSubmit(
            async (data, e) => {
              setIsSubmitting(true);
              // handle special case for WEEKLY DIGEST
              // for weekly digest, at least one channel must be selected
              // if no, then show error message
              if (type === "WEEKLY_DIGEST" && data.channels.length === 0) {
                setError("channels", {
                  type: "manual",
                  message:
                    "At least one channel must be selected for Weekly Digest",
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
              Distribution Channels:
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
          <Flex className="gap-x-1 text-gray-11">
            <Badge size="1" color="orange">
              BETA
            </Badge>
            <Text size="1">
              Distribute by Slack is currently in beta version. Only people in
              Cornell-NLP slack workspace can use this feature. And the email
              account of the slack account must match the RecNet account.
            </Text>
          </Flex>
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
      </Accordion.Content>
    </Accordion.Item>
  );
}

export function SubscriptionSetting() {
  const { data, isFetching } = trpc.getSubscriptions.useQuery();
  const { data: slackOAuthData, isFetching: isFetchingSlackOAuthData } =
    trpc.getSlackOAuthStatus.useQuery();

  console.log(slackOAuthData);

  const [openedType, setOpenType] = useState<SubscriptionType | undefined>(
    undefined
  );

  return (
    <div>
      <Dialog.Title>Subscription Setting</Dialog.Title>
      <Dialog.Description size="2" mb="4" className="text-gray-11">
        Customize the subscription types and channels that best fits your needs.
      </Dialog.Description>

      <Text size="4" className="block mb-2">
        Subscriptions
      </Text>
      {isFetching ? (
        <LoadingBox />
      ) : (
        <Accordion.Root
          className="w-full rounded-md shadow-black/5"
          type="single"
          collapsible
          value={openedType as string | undefined}
          onValueChange={(value) => setOpenType(value as SubscriptionType)}
        >
          {subscriptionTypeSchema.options.map((subType) => {
            const subscriptionTypeObj = (data?.subscriptions ?? []).find(
              (sub) => sub.type === subType
            );
            return (
              <SubscriptionTypeCard
                key={subType}
                type={subType}
                selectedChannels={subscriptionTypeObj?.channels ?? []}
              />
            );
          })}
        </Accordion.Root>
      )}

      <Text size="4" className="block mb-2 mt-4">
        Slack Integration
      </Text>
      {isFetchingSlackOAuthData ? (
        <LoadingBox />
      ) : slackOAuthData?.workspaceName === null ? (
        <RecNetLink href="api/slack/oauth/install">
          <Button variant="solid">
            Add Slack Integration to your workspace
          </Button>
        </RecNetLink>
      ) : (
        <Text size="2" mb="2" className="text-gray-11">
          Currently integrated with workspace: {slackOAuthData?.workspaceName}
        </Text>
      )}
    </div>
  );
}

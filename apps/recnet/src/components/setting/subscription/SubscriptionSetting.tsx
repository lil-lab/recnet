"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { Card, Dialog, Flex, Text } from "@radix-ui/themes";
import { ChevronDown } from "lucide-react";

import { trpc } from "@recnet/recnet-web/app/_trpc/client";
import { LoadingBox } from "@recnet/recnet-web/components/LoadingBox";
import { cn } from "@recnet/recnet-web/utils/cn";

import {
  SubscriptionChannel,
  SubscriptionType,
  subscriptionTypeSchema,
} from "@recnet/recnet-api-model";

const transformSubscriptionEnum = (subType: string): string => {
  return subType
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

function SubscriptionTypeCard(props: {
  type: SubscriptionType;
  selectedChannels: SubscriptionChannel[];
}) {
  const { type, selectedChannels } = props;
  const title = transformSubscriptionEnum(type);
  const isActivated = selectedChannels.length > 0;

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
      <Accordion.Content>
        <Flex className="p-4 text-[14px]">
          Yes. It adheres to the WAI-ARIA design pattern.
        </Flex>
      </Accordion.Content>
    </Accordion.Item>
  );
}

export function SubscriptionSetting() {
  const { data, isLoading } = trpc.getSubscriptions.useQuery();

  return (
    <div>
      <Dialog.Title>Subscription Setting</Dialog.Title>
      <Dialog.Description size="2" mb="4" className="text-gray-11">
        Customize the subscription types and channels that best fits your needs.
      </Dialog.Description>

      <Text size="4" className="block mb-2">
        Subscriptions
      </Text>
      {isLoading ? (
        <LoadingBox />
      ) : (
        <Accordion.Root
          className="w-full rounded-md shadow-black/5"
          type="single"
          collapsible
        >
          {subscriptionTypeSchema.options.map((subType) => {
            const userSubscriptionObj = (data?.subscriptions ?? []).find(
              (sub) => sub.type === subType
            );
            return (
              <SubscriptionTypeCard
                key={subType}
                type={subType}
                selectedChannels={userSubscriptionObj?.channels ?? []}
              />
            );
          })}
        </Accordion.Root>
      )}
    </div>
  );
}

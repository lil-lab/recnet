"use client";

import { Dialog, Text } from "@radix-ui/themes";

export function SubscriptionSetting() {
  return (
    <div>
      <Dialog.Title>Subscription Setting</Dialog.Title>
      <Dialog.Description size="2" mb="4" className="text-gray-11">
        Customize the subscription types and channels that best fits your needs.
      </Dialog.Description>

      <Text size="4" className="block">
        Subscriptions
      </Text>
    </div>
  );
}

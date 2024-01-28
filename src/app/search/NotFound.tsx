"use client";

import { Callout } from "@radix-ui/themes";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";

export function NotFoundBlock() {
  return (
    <Callout.Root color="amber" size="2">
      <Callout.Icon>
        <QuestionMarkCircledIcon width="20" height="20" />
      </Callout.Icon>
      <Callout.Text size="2">
        Your search did not match any users. Please check the spelling and try
        again
      </Callout.Text>
    </Callout.Root>
  );
}

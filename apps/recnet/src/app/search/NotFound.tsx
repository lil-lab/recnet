"use client";

import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import { Callout } from "@radix-ui/themes";

const DEFAULT_MESSAGE =
  "Your search did not match any users. Please check the spelling and try again";

export function NotFoundBlock(props: { message?: string }) {
  const { message = DEFAULT_MESSAGE } = props;
  return (
    <Callout.Root color="amber" size="2">
      <Callout.Icon>
        <QuestionMarkCircledIcon width="20" height="20" />
      </Callout.Icon>
      <Callout.Text size="2">{message}</Callout.Text>
    </Callout.Root>
  );
}

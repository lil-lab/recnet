"use client";

import { CopyIcon } from "@radix-ui/react-icons";
import { Flex, Text } from "@radix-ui/themes";
import { toast } from "sonner";

import { useCopyToClipboard } from "@recnet/recnet-web/hooks/useCopyToClipboard";

export const CopiableInviteCode = (props: { inviteCode: string }) => {
  const { inviteCode } = props;
  const { copy } = useCopyToClipboard();

  return (
    <Flex
      className="gap-x-2 items-center cursor-pointer group w-fit"
      onClick={() => {
        copy(inviteCode).then(() => {
          // toast
          toast.success("Copied to clipboard!");
        });
      }}
    >
      <Text
        className="font-mono text-[14px] text-gray-10 group-hover:text-gray-11 whitespace-nowrap"
        weight={"medium"}
      >
        {inviteCode}
      </Text>
      <CopyIcon className="text-gray-8 group-hover:text-gray-10 transition-all ease-in-out" />
    </Flex>
  );
};

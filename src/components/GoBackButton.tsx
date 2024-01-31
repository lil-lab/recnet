"use client";
import { Flex } from "@radix-ui/themes";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";

export function GoBackButton() {
  const router = useRouter();
  return (
    <Flex
      className="items-center gap-x-1 p-1 group text-accent-11"
      onClick={() => {
        router.back();
      }}
    >
      <ChevronLeftIcon
        width="16"
        height="16"
        className="relative right-0 group-hover:right-1 transition-all ease-in-out"
      />
      Back
    </Flex>
  );
}

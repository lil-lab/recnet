"use client";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import { Flex } from "@radix-ui/themes";
import { useRouter } from "next/navigation";

import { useHistory } from "@recnet/recnet-web/app/HistoryProvider";

export function GoBackButton() {
  const isWithinPage = useHistory();
  const router = useRouter();

  return (
    <Flex
      className="items-center gap-x-1 p-1 group text-gray-10 cursor-pointer"
      onClick={() => {
        if (isWithinPage) {
          router.back();
        } else {
          router.replace("/");
        }
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

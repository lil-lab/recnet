import { Flex, Spinner } from "@radix-ui/themes";
import React from "react";

import { cn } from "../utils/cn";

interface LoadingBoxProps {
  className?: string;
}

export function LoadingBox(props: LoadingBoxProps) {
  const { className } = props;
  return (
    <Flex className={cn("justify-center items-center w-full", className)}>
      <Spinner size="3" className="text-[#909090]" />
    </Flex>
  );
}

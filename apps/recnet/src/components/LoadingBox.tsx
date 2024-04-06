import { Flex } from "@radix-ui/themes";
import React from "react";
import { TailSpin } from "react-loader-spinner";

import { cn } from "../utils/cn";

interface LoadingBoxProps extends React.ComponentProps<typeof Flex> {
  className?: string;
}

export function LoadingBox(props: LoadingBoxProps) {
  const { className, ...rest } = props;
  return (
    <Flex
      className={cn("justify-center items-center w-full", className)}
      {...rest}
    >
      <TailSpin
        radius={"3"}
        visible={true}
        height="40"
        width="40"
        color={"#909090"}
        ariaLabel="line-wave-loading"
        wrapperClass="w-fit h-fit"
      />
    </Flex>
  );
}

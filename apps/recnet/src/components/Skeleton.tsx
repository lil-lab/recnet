import { Text, Skeleton as RadixSkeleton } from "@radix-ui/themes";
import React, { ComponentProps } from "react";

type SkeletonProps = ComponentProps<typeof RadixSkeleton>;

export function Skeleton(props: SkeletonProps) {
  return <RadixSkeleton {...props} />;
}

type SkeletonTextProps = ComponentProps<typeof RadixSkeleton> & {
  size?: ComponentProps<typeof Text>["size"];
};

export function SkeletonText(props: SkeletonTextProps) {
  const { className, children, size, ...rest } = props;
  return (
    <RadixSkeleton className={className} {...rest}>
      <Text size={size}>{children ?? "Skeleton"}</Text>
    </RadixSkeleton>
  );
}

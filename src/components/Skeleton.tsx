import { cn } from "@/utils/cn";
import React, { ComponentProps } from "react";
import { Text } from "@radix-ui/themes";

type SkeletonProps = React.PropsWithChildren<
  React.HTMLAttributes<HTMLDivElement> & {
    className?: string;
  }
>;

export function Skeleton(props: SkeletonProps) {
  const { children, className, ...rest } = props;
  return (
    <div className={cn("bg-gray-5", "animate-skeleton", className)} {...rest}>
      <div className="invisible overflow-hidden">{children}</div>
    </div>
  );
}

type SkeletonTextProps = ComponentProps<typeof Text>;

export function SkeletonText(props: SkeletonTextProps) {
  return (
    <Skeleton>
      <Text {...props}>Skeleton</Text>
    </Skeleton>
  );
}

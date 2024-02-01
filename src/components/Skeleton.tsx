import { cn } from "@/utils/cn";
import React from "react";

type SkeletonProps = React.PropsWithChildren<
  React.HTMLAttributes<HTMLDivElement> & {
    className?: string;
  }
>;

export function Skeleton(props: SkeletonProps) {
  const { children, className, ...rest } = props;
  return (
    <div className={cn("bg-gray-5", "animate-skeleton", className)} {...rest}>
      <div className="invisible">{children}</div>
    </div>
  );
}

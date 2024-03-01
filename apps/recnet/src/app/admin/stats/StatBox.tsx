import { SkeletonText } from "@/components/Skeleton";
import { cn } from "@/utils/cn";

export function StatBox({
  children,
  title,
  icon,
  className,
}: {
  children: React.ReactNode;
  title: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-4",
        "border-[1px]",
        "border-gray-6",
        "flex",
        "flex-col",
        "p-6",
        "gap-y-3",
        "w-fit",
        className
      )}
    >
      <div
        className={cn(
          "flex flex-row gap-x-1 text-gray-11 text-[14px] font-medium items-center"
        )}
      >
        {icon}
        {title}
      </div>
      <div className={cn("text-gray-12", "text-[36px]", "h-full")}>
        {children}
      </div>
    </div>
  );
}

export function StatBoxSkeleton() {
  return (
    <div
      className={cn(
        "rounded-4",
        "border-[1px]",
        "border-gray-6",
        "flex",
        "flex-col",
        "p-6",
        "gap-y-3",
        "w-fit"
      )}
    >
      <SkeletonText className="text-[14px]" />
      <SkeletonText className="text-[36px]" />
    </div>
  );
}

import { SkeletonText } from "@/components/Skeleton";
import { cn } from "@/utils/cn";
import { Text } from "@radix-ui/themes";

export function StatBox({
  children,
  title,
  icon,
}: {
  children: React.ReactNode;
  title: React.ReactNode;
  icon?: React.ReactNode;
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
        "w-fit"
      )}
    >
      <div className="flex flex-row gap-x-1 text-gray-11 text-[14px] font-medium items-center">
        {icon}
        {title}
      </div>
      <div className={cn("text-gray-12")}>
        <Text size="8">{children}</Text>
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

import { RecCardSkeleton } from "@/components/RecCard";
import { cn } from "@/utils/cn";

export default function Loading() {
  // array of skeletons of rec card
  return (
    <div
      className={cn(
        "w-[80%]",
        "md:w-[65%]",
        "flex",
        "flex-col",
        "gap-y-4",
        "mx-auto",
        "py-12"
      )}
    >
      {Array.from({ length: 5 }).map((_, idx) => {
        return <RecCardSkeleton key={idx} />;
      })}
    </div>
  );
}

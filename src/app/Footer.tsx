import { cn } from "@/utils/cn";
import { Text } from "@radix-ui/themes";

function Footer() {
  return (
    <div
      className={cn(
        "w-full",
        "border-0",
        "md:border-t-[1px]",
        "border-slate-6",
        "flex",
        "justify-center",
        "items-center",
        "flex-row",
        "text-gray-8",
        "h-[44px]"
      )}
    >
      <Text size="2">© 2024 RecNet. All rights reserved.</Text>
    </div>
  );
}

export { Footer };

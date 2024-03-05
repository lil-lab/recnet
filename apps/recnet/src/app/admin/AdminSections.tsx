import { Text } from "@radix-ui/themes";
import { cn } from "@/utils/cn";

export function AdminSectionTitle(props: {
  children: React.ReactNode;
  description?: string;
}) {
  const { children, description } = props;
  return (
    <div className={cn("w-full py-2 flex flex-col gap-y-2")}>
      <Text size="6" weight={"medium"} className="text-gray-12">
        {children}
      </Text>
      {description ? (
        <Text size="2" className="text-gray-10">
          {description}
        </Text>
      ) : null}
    </div>
  );
}

export function AdminSectionBox(props: { children: React.ReactNode }) {
  const { children } = props;

  return (
    <div
      className={cn(
        "flex",
        "w-full",
        "p-4",
        "border-[1px]",
        "rounded-4",
        "border-gray-6"
      )}
    >
      {children}
    </div>
  );
}

import { cn } from "@recnet/recnet-web/utils/cn";
import { Flex, Text } from "@radix-ui/themes";
import { RecNetLink } from "@recnet/recnet-web/components/Link";

export const ReportEmailAccount = "lil.recnet@gmail.com";

export default function NotFoundPage() {
  return (
    <div
      className={cn(
        "w-full",
        "lg:w-[60%]",
        `min-h-[90svh]`,
        "flex",
        "flex-col",
        "p-8",
        "gap-y-6",
        "justify-center",
        "items-center"
      )}
    >
      <Flex className="items-center gap-x-8">
        <Text className="text-gray-10 text-[72px]" weight="medium">
          404
        </Text>
        <div className="w-[2px] bg-gray-10 h-[75%]" />
        <div className="flex flex-col gap-y-1">
          <Text className="text-gray-11 text-[24px]" weight="medium">
            Page not found
          </Text>
          <Text className="text-gray-10 text-[16px]">
            The page you are looking for does not exist.
          </Text>
          <Flex className="items-center gap-x-2 text-gray-10 text-[16px] flex-wrap">
            <Text>Go back to </Text>
            <RecNetLink href="/">
              <Text className="text-blue-9 text-[16px]">home</Text>
            </RecNetLink>
            <Text> or </Text>
            <RecNetLink href={`mailto:${ReportEmailAccount}`}>
              <Text className="text-blue-9 text-[16px]">report issue</Text>
            </RecNetLink>
            <Text> to us</Text>
          </Flex>
        </div>
      </Flex>
    </div>
  );
}

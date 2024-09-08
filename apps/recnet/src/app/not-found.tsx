import { Flex, Text } from "@radix-ui/themes";

import { RecNetLink } from "@recnet/recnet-web/components/Link";
import {
  ErrorBlock,
  ReportEmailAccount,
} from "@recnet/recnet-web/components/error";
import { cn } from "@recnet/recnet-web/utils/cn";

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
      <ErrorBlock
        code={404}
        actionSection={
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
        }
      />
    </div>
  );
}

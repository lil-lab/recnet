import { Flex, Text } from "@radix-ui/themes";

export const ReportEmailAccount = "lil.recnet@gmail.com";

function getErrorNameAndDesc(code: number) {
  switch (code) {
    case 404:
      return {
        name: "Page not found",
        desc: "The page you are looking for does not exist.",
      };
    case 500:
      return {
        name: "Internal Server Error",
        desc: "Unexpected error occurred. Please help us by reporting this issue.",
      };
    case 521:
      return {
        name: "Web Server Is Down",
        desc: "Unexpected error occurred. Please help us by reporting this issue.",
      };
    default:
      return {
        name: "Unexpected Error",
        desc: "Unexpected error occurred. Please help us by reporting this issue.",
      };
  }
}

export interface ErrorBlockProps {
  code: number;
  actionSection?: React.ReactNode;
}

export function ErrorBlock(props: ErrorBlockProps) {
  const { code, actionSection = null } = props;
  const { name, desc } = getErrorNameAndDesc(code);
  return (
    <Flex className="items-center gap-x-8">
      <Text className="text-gray-10 text-[72px]" weight="medium">
        {code}
      </Text>
      <div className="w-[2px] bg-gray-10 h-[75%]" />
      <div className="flex flex-col gap-y-1">
        <Text className="text-gray-11 text-[24px]" weight="medium">
          {name}
        </Text>
        <Text className="text-gray-10 text-[16px]">{desc}</Text>
        {actionSection}
      </div>
    </Flex>
  );
}

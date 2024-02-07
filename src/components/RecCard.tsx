import { getUserById } from "@/server/user";
import { Rec } from "@/types/rec";
import { cn } from "@/utils/cn";
import { Flex, Text } from "@radix-ui/themes";
import { Avatar } from "./Avatar";
import { RecNetLink } from "./Link";
import { formatDate, getDateFromFirebaseTimestamp } from "@/utils/date";
import { ChevronRight } from "lucide-react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Skeleton, SkeletonText } from "@/components/Skeleton";

export function RecCardSkeleton() {
  return (
    <div
      className={cn(
        "flex",
        "flex-col",
        "p-3",
        "gap-y-2",
        "border-[1px]",
        "border-gray-6",
        "rounded-[8px]",
        "shadow-2"
      )}
    >
      <Flex className="items-center gap-x-3 p-2">
        <Skeleton className="w-[40px] aspect-square rounded-[999px]" />
        <Flex className="items-end">
          <SkeletonText size="2" />
        </Flex>
      </Flex>
      <Flex className="p-2">
        <SkeletonText size="3" />
      </Flex>
      <Flex
        direction={"column"}
        className={cn("p-4", "gap-y-3", "bg-gray-3", "rounded-2")}
      >
        <SkeletonText size="5" />
        <SkeletonText size="2" />
        <Flex className="items-center justify-between p-1">
          <Flex className="items-center gap-x-2 text-gray-10">
            <SkeletonText size="2" />
          </Flex>
          <Flex className="items-center gap-x-1 text-accent-11">
            <SkeletonText size="1" />
          </Flex>
        </Flex>
      </Flex>
    </div>
  );
}

// server component
export async function RecCard(props: { rec: Rec }) {
  const { rec } = props;
  const user = await getUserById(rec.userId);
  const cutoff = formatDate(getDateFromFirebaseTimestamp(rec.cutoff));

  if (!user) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex",
        "flex-col",
        "p-3",
        "gap-y-2",
        "border-[1px]",
        "border-gray-6",
        "rounded-[8px]",
        "shadow-2"
      )}
    >
      <Flex className="items-center gap-x-3 p-2">
        <Avatar user={user} className="w-[40px] aspect-square" />
        <Flex className="items-end">
          <RecNetLink
            href={`/user/${user.username}`}
            radixLinkProps={{
              size: "2",
            }}
          >
            <Text size="2">{user.displayName}</Text>
          </RecNetLink>
          <Text
            size="2"
            className="text-gray-10"
            weight="medium"
          >{`'s rec on ${cutoff}`}</Text>
        </Flex>
      </Flex>
      <Flex className="p-2">
        <Text size="3" className="text-gray-11">
          {rec.description}
        </Text>
      </Flex>
      <a href={rec.link} target="_blank" rel="noreferrer" className="group">
        <Flex
          direction={"column"}
          className={cn("p-4", "gap-y-3", "bg-gray-3", "rounded-2")}
        >
          <Text size="5" className="text-accent-11 font-medium">
            {rec.title}
          </Text>
          <Text size="2" className="text-gray-10">
            {rec.author}
          </Text>
          <Flex className="items-center justify-between p-1">
            <Flex className="items-center gap-x-2 text-gray-10">
              <CalendarIcon width={16} height={16} />
              <Text size="2">{`${!rec.month ? "" : `${rec.month}, `}${rec.year}`}</Text>
            </Flex>
            <Flex className="items-center gap-x-1 text-accent-11">
              <Text size="1">Read</Text>{" "}
              <ChevronRight
                size="16"
                className="relative left-0 group-hover:left-[4px] transition-all duration-200 ease-in-out"
              />
            </Flex>
          </Flex>
        </Flex>
      </a>
    </div>
  );
}

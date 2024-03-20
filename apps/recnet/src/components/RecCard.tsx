import { CalendarIcon } from "@radix-ui/react-icons";
import { Flex, Text } from "@radix-ui/themes";
import { ChevronRight } from "lucide-react";

import {
  formatDate,
  getDateFromFirebaseTimestamp,
} from "@recnet/recnet-date-fns";

import { Skeleton, SkeletonText } from "@recnet/recnet-web/components/Skeleton";
import { RecWithUser } from "@recnet/recnet-web/types/rec";
import { cn } from "@recnet/recnet-web/utils/cn";

import { Avatar } from "./Avatar";
import { RecNetLink } from "./Link";

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
      <Flex className="items-start gap-x-3 px-4 py-2">
        <Skeleton className="w-[40px] aspect-square rounded-[999px]" />
        <Flex className="flex flex-col gap-y-1">
          <Flex className="items-end">
            <SkeletonText size="2" />
          </Flex>
          <Flex>
            <SkeletonText size="3" className="w-[20vw]" />
          </Flex>
        </Flex>
      </Flex>
    </div>
  );
}

export function RecCard(props: {
  recsWithUsers: RecWithUser[];
  showDate?: boolean;
}) {
  const { recsWithUsers, showDate = false } = props;
  const hasRec = recsWithUsers.length > 0;
  const cutoff = hasRec
    ? formatDate(getDateFromFirebaseTimestamp(recsWithUsers[0].cutoff))
    : null;
  const rec = hasRec ? recsWithUsers[0] : null;

  if (!hasRec || !rec) {
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
      {recsWithUsers.map((recWithUser) => {
        const { user } = recWithUser;
        return (
          <Flex
            className="items-start gap-x-3 px-4 py-2"
            key={recWithUser.userId}
          >
            <Avatar user={user} className="w-[40px] aspect-square" />
            <Flex className="flex flex-col gap-y-1">
              <Text className="items-end">
                <RecNetLink
                  href={`/${user.username}`}
                  radixLinkProps={{
                    size: "2",
                  }}
                >
                  <Text size="2">{user.displayName}</Text>
                </RecNetLink>
                {showDate ? (
                  <Text
                    size="2"
                    className="text-gray-10"
                    weight="medium"
                  >{` recommended on on ${cutoff}`}</Text>
                ) : null}
              </Text>
              <Flex>
                <Text size="3" className="text-gray-11">
                  {rec.description}
                </Text>
              </Flex>
            </Flex>
          </Flex>
        );
      })}
    </div>
  );
}

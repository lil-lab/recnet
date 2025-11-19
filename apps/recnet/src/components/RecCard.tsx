import { CalendarIcon, CheckCircledIcon } from "@radix-ui/react-icons";
import { Flex, Text, Tooltip } from "@radix-ui/themes";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { Avatar } from "@recnet/recnet-web/components/Avatar";
import { RecNetLink } from "@recnet/recnet-web/components/Link";
import { Skeleton, SkeletonText } from "@recnet/recnet-web/components/Skeleton";
import { cn } from "@recnet/recnet-web/utils/cn";

import { numToMonth } from "@recnet/recnet-date-fns";
import { formatDate } from "@recnet/recnet-date-fns";

import { Rec, Activity, Reaction } from "@recnet/recnet-api-model";

import { LinkCopyButton } from "./LinkCopyButton";
import { SelfRecBadge } from "./SelfRecBadge";

import { RecReactionsList } from "../app/rec/[id]/RecReactionsList";
import { getSharableLink } from "../utils/getSharableRecLink";

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

export function RecCard(props: { recs: Rec[]; showDate?: boolean }) {
  const { recs, showDate = false } = props;
  const hasRec = recs.length > 0;
  const cutoff = hasRec ? formatDate(new Date(recs[0].cutoff)) : null;
  const rec = hasRec ? recs[0] : null;

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
      <a
        href={rec.article.link}
        target="_blank"
        rel="noreferrer"
        className="group"
      >
        <Flex
          direction={"column"}
          className={cn("p-4", "gap-y-3", "bg-gray-3", "rounded-2")}
        >
          <Text size="5" className="text-accent-11 font-medium">
            {rec.article.title}
          </Text>
          <Text size="2" className="text-gray-10">
            {rec.article.author}
          </Text>
          <Flex className="items-center justify-between p-1">
            <Flex className="items-center gap-x-2 text-gray-10">
              <CalendarIcon width={16} height={16} />
              <Text size="2">{`${!rec.article.month ? "" : `${numToMonth[rec.article.month]}, `}${rec.article.year}`}</Text>
              {rec.article.isVerified ? (
                <Tooltip content="This article comes from trusted sources.">
                  <div className="flex items-center gap-x-1 cursor-pointer mx-2">
                    <CheckCircledIcon />
                    <Text size="2">Verified</Text>
                  </div>
                </Tooltip>
              ) : null}
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
      {recs.map((rec) => {
        const { user } = rec;
        return (
          <Flex className="items-start gap-x-3 px-4 py-2" key={user.id}>
            <Avatar user={user} className="w-[40px] aspect-square" />
            <Flex className="flex flex-col gap-y-1">
              <Flex className="items-center gap-x-2">
                <RecNetLink
                  href={`/${user.handle}`}
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
                  >{` recommended on ${cutoff}`}</Text>
                ) : null}
                {rec.isSelfRec ? <SelfRecBadge /> : null}
                <LinkCopyButton link={getSharableLink(rec)} />
              </Flex>
              <Link
                href={getSharableLink(rec)}
                key={user.id}
                className="hover:bg-gray-2 rounded-4 transition-all ease-in-out"
              >
                <Flex>
                  <Text size="3" className="text-gray-11">
                    {rec.description}
                  </Text>
                </Flex>
              </Link>
              <div className="mt-2">
                <RecReactionsList id={rec.id} />
              </div>
            </Flex>
          </Flex>
        );
      })}
    </div>
  );
}

export function ActivityCard(props: {
  activity: Activity;
  showDate?: boolean;
}) {
  const { activity, showDate = false } = props;

  if (activity.type === "REC") {
    return <RecCard recs={[activity.data as Rec]} showDate={showDate} />;
  }

  // For reaction type activities
  const reaction = activity.data as Reaction;
  const rec = reaction.recommendation;

  if (!rec) {
    return null;
  }

  // Get emoji for reaction type
  const reactionEmoji = (() => {
    switch (reaction.reaction) {
      case "THUMBS_UP":
        return "👍";
      case "THINKING":
        return "🤔";
      case "SURPRISED":
        return "😮";
      case "CRYING":
        return "😢";
      case "STARRY_EYES":
        return "🤩";
      case "MINDBLOWN":
        return "🤯";
      case "EYES":
        return "👀";
      case "ROCKET":
        return "🚀";
      case "HEART":
        return "❤️";
      case "PRAY":
        return "🙏";
      case "PARTY":
        return "🎉";
      default:
        return "👍";
    }
  })();

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
      <Flex className="items-center gap-x-2 px-4 py-2 text-gray-10">
        <Avatar user={reaction.user} className="w-[40px] aspect-square" />
        <Text size="3">{reaction.user.displayName} reacted</Text>
        <Text size="6">{reactionEmoji}</Text>
      </Flex>

      <a
        href={rec.article.link}
        target="_blank"
        rel="noreferrer"
        className="group"
      >
        <Flex
          direction={"column"}
          className={cn("p-3", "gap-y-2", "bg-gray-2", "rounded-2")}
        >
          <Text size="4" className="text-accent-10 font-medium">
            {rec.article.title}
          </Text>
          <Text size="1" className="text-gray-9">
            {rec.article.author}
          </Text>
          <Flex className="items-center justify-between p-1">
            <Flex className="items-center gap-x-2 text-gray-9">
              <CalendarIcon width={14} height={14} />
              <Text size="1">{`${!rec.article.month ? "" : `${numToMonth[rec.article.month]}, `}${rec.article.year}`}</Text>
              {rec.article.isVerified ? (
                <Tooltip content="This article comes from trusted sources.">
                  <div className="flex items-center gap-x-1 cursor-pointer mx-2">
                    <CheckCircledIcon width={14} height={14} />
                    <Text size="1">Verified</Text>
                  </div>
                </Tooltip>
              ) : null}
            </Flex>
            <Flex className="items-center gap-x-1 text-accent-10">
              <Text size="1">Read</Text>{" "}
              <ChevronRight
                size="14"
                className="relative left-0 group-hover:left-[4px] transition-all duration-200 ease-in-out"
              />
            </Flex>
          </Flex>
        </Flex>
      </a>

      <Flex className="items-start gap-x-3 px-4 py-2">
        <Avatar user={rec.user} className="w-[40px] aspect-square" />
        <Flex className="flex flex-col gap-y-1">
          <Flex className="items-center gap-x-2">
            <RecNetLink
              href={`/${rec.user.handle}`}
              radixLinkProps={{
                size: "2",
              }}
            >
              <Text size="2">{rec.user.displayName}</Text>
            </RecNetLink>
            {showDate ? (
              <Text
                size="1"
                className="text-gray-9"
                weight="medium"
              >{` recommended on ${formatDate(new Date(rec.cutoff))}`}</Text>
            ) : null}
            {rec.isSelfRec ? <SelfRecBadge /> : null}
            <LinkCopyButton link={getSharableLink(rec)} />
          </Flex>
          <Link
            href={getSharableLink(rec)}
            className="hover:bg-gray-2 rounded-4 transition-all ease-in-out"
          >
            <Flex>
              <Text size="2" className="text-gray-10">
                {rec.description}
              </Text>
            </Flex>
          </Link>
          <div className="mt-2">
            <RecReactionsList id={rec.id} />
          </div>
        </Flex>
      </Flex>
    </div>
  );
}

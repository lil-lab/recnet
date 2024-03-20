"use client";

import { RecNetLink } from "@recnet/recnet-web/components/Link";
import { cn } from "@recnet/recnet-web/utils/cn";
import {
  getCutOffFromStartDate,
  getCutOff,
  getLatestCutOff,
  getNextCutOff,
  getVerboseDateString,
} from "@recnet/recnet-date-fns";
import { Text, Flex, Button } from "@radix-ui/themes";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@recnet/recnet-web/app/AuthContext";
import { Pencil1Icon } from "@radix-ui/react-icons";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Rec } from "@recnet/recnet-api-model";
import { Skeleton, SkeletonText } from "@recnet/recnet-web/components/Skeleton";
import { RecForm } from "@recnet/recnet-web/components/RecForm";
import { CutoffDropdown } from "@recnet/recnet-web/components/CutoffDropdown";
import { trpc } from "../_trpc/client";

function RecStatusPanel(props: {
  setIsRecFormOpen: (open: boolean) => void;
  rec: Rec | null;
  isLoading: boolean;
}) {
  const { setIsRecFormOpen, rec, isLoading } = props;
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className={cn("flex", "flex-col", "gap-y-3")}>
        <SkeletonText size="2" className="w-[100px]" />
        <SkeletonText size="2" />
        <Flex className="w-full">
          <Button
            size={{
              initial: "2",
              lg: "3",
            }}
            className="w-full px-0"
            variant={"surface"}
            disabled
          >
            <Skeleton className="h-full w-full" />
          </Button>
        </Flex>
        <Text size="1" weight="medium" className="text-gray-9 p-1">
          {`This cycle concludes on ${getVerboseDateString(getNextCutOff())}.`}
        </Text>
      </div>
    );
  }

  return (
    <div className={cn("flex", "flex-col", "gap-y-3")}>
      <Text
        size="2"
        className="text-gray-11 p-1"
        weight="medium"
        asChild={rec ? true : undefined}
      >
        {rec ? (
          <p>
            Upcoming rec:{" "}
            <span
              className="text-blue-11 cursor-pointer"
              onClick={() => {
                // open window
                window.open(rec.article.link, "_blank");
              }}
            >
              {rec.article.title}
            </span>
          </p>
        ) : (
          `Hi, ${user?.displayName} 👋`
        )}
      </Text>
      <Text size="2" className="text-gray-11 p-1" weight="medium">
        {rec
          ? "You can modify at anytime before this cycle ends."
          : `Any interesting read this week?`}
      </Text>
      <Flex className="w-full">
        <Button
          size={{
            initial: "2",
            lg: "3",
          }}
          className="w-full cursor-pointer"
          onClick={() => {
            setIsRecFormOpen(true);
          }}
          variant={rec ? "outline" : "solid"}
        >
          <Pencil1Icon width="16" height="16" />
          {rec ? "Edit your rec" : "Recommend a paper"}
        </Button>
      </Flex>
      <Text size="1" weight="medium" className="text-gray-9 p-1">
        {`This cycle concludes on ${getVerboseDateString(getNextCutOff())}.`}
      </Text>
    </div>
  );
}

export function LeftPanel() {
  const searchParams = useSearchParams();
  const date = searchParams.get("date");
  const cutoff = date ? getCutOff(new Date(date)) : getLatestCutOff();
  const cutoffs = getCutOffFromStartDate();
  const { revalidateUser } = useAuth();
  const { data, isPending, isFetching } = trpc.getUpcomingRec.useQuery();
  const rec = data?.rec ?? null;
  const utils = trpc.useUtils();

  const [isRecFormOpen, setIsRecFormOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          {
            "w-[17%]": !isRecFormOpen,
            "w-[350px]": isRecFormOpen,
          },
          "min-w-[250px]",
          `min-h-[90svh]`,
          "border-r-[1px]",
          "border-gray-6",
          "p-4",
          "transition-all",
          "duration-200",
          "ease-in-out",
          "hidden",
          "md:inline-block"
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isRecFormOpen ? (
            <motion.div
              key="rec-form"
              className={cn(
                "flex",
                "flex-col",
                "gap-y-3",
                "sticky",
                "top-[80px]"
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.2,
              }}
            >
              <div
                className="flex flex-row gap-x-1 py-1 items-center text-accent-11 cursor-pointer"
                onClick={() => {
                  setIsRecFormOpen(false);
                }}
              >
                <ChevronLeft width="16" height="16" />
                Back
              </div>
              <Text size="2" className="text-gray-11 p-1" weight="medium">
                {`Any interesting read this week?`}
              </Text>
              <RecForm
                onFinish={() => {
                  setIsRecFormOpen(false);
                }}
                currentRec={rec}
                onUpdateSuccess={async () => {
                  await revalidateUser();
                  await utils.getUpcomingRec.invalidate();
                }}
                onDeleteSuccess={async () => {
                  await revalidateUser();
                  await utils.getUpcomingRec.invalidate();
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="left-panel"
              className={cn(
                "flex",
                "flex-col",
                "gap-y-3",
                "sticky",
                "top-[80px]"
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.2,
              }}
            >
              <RecStatusPanel
                setIsRecFormOpen={setIsRecFormOpen}
                rec={rec}
                isLoading={isPending || isFetching}
              />
              <div className="w-full h-[1px] bg-gray-8" />
              <div className="w-full p-2 flex flex-col gap-y-2">
                <Text size="1" weight={"medium"} className="text-gray-11">
                  Previous cycles
                </Text>
                <div className="flex flex-col py-1 px-2 gap-y-2">
                  {cutoffs.map((d, idx) => {
                    const year = d.getFullYear();
                    const month = d.getMonth() + 1;
                    const day = d.getDate();
                    const key = `${month}/${day}/${year}`;
                    return (
                      <RecNetLink
                        href={`/feeds?date=${key}`}
                        key={idx}
                        radixLinkProps={{
                          size: "1",
                          weight:
                            cutoff.getTime() === d.getTime()
                              ? "bold"
                              : "regular",
                        }}
                      >
                        {key}
                      </RecNetLink>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div
        className={cn(
          "md:hidden",
          "flex",
          "justify-end",
          "w-[80%]",
          "mx-auto",
          "pt-4"
        )}
      >
        <CutoffDropdown currentCutoff={cutoff} cutoffs={cutoffs} />
      </div>
    </>
  );
}

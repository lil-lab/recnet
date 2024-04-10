"use client";
import { Cross1Icon } from "@radix-ui/react-icons";
import { Button, Text } from "@radix-ui/themes";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";

import useMount from "../hooks/useMount";
import { cn } from "../utils/cn";

interface AnnouncementCardProps {
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
  announcementKey: string;
}

export function AnnouncementCard(props: AnnouncementCardProps) {
  const { icon = undefined, announcementKey, className = "", children } = props;
  const announcementKeyPrefix = "announcement-";
  const localStorageKey = `${announcementKeyPrefix}${announcementKey}`;
  const [show, setShow] = useState(false);

  useMount(() => {
    // look for the announcement in local storage
    const notShowAgain = localStorage.getItem(localStorageKey);
    if (notShowAgain) return;
    setShow(true);
  });

  return (
    <AnimatePresence mode="wait">
      {show ? (
        <motion.div
          key={announcementKey}
          className={cn(
            "w-full",
            "p-4",
            "rounded-4",
            "border-[1px] border-blue-8",
            "bg-blueA-5",
            "flex",
            "flex-col",
            "gap-y-2",
            "sm:flex-row",
            "sm:justify-between",
            "sm:items-center",
            "text-gray-11",
            "text-[14px]",
            className
          )}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="flex flex-row w-full sm:max-w-[80%] gap-x-2 items-center flex-wrap">
            <Text>
              <span className="mr-1">{icon || "📢"}</span> {children}
            </Text>
          </div>
          <div className="w-full flex flex-row justify-end sm:justify-start gap-x-2 items-center sm:w-fit">
            <Button
              variant="ghost"
              className="text-gray-10 cursor-pointer text-[12px] transition-all ease-in-out"
              onClick={() => {
                localStorage.setItem(localStorageKey, "true");
                setShow(false);
              }}
            >{`Don't show again`}</Button>
            <Cross1Icon
              className="w-4 h-4 cursor-pointer ml-1 text-gray-11 hover:text-gray-12"
              onClick={() => setShow(false)}
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

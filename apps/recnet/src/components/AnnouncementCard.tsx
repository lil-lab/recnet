"use client";
import { Cross1Icon } from "@radix-ui/react-icons";
import { Button, Text } from "@radix-ui/themes";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";

import useMount from "../hooks/useMount";
import { cn } from "../utils/cn";

interface AnnouncementCardProps {
  className?: string;
  title: string;
  content: string;
  allowClose?: boolean;
  id: string;
  isPreview?: boolean;
}

export function AnnouncementCard(props: AnnouncementCardProps) {
  const {
    className = "",
    title,
    content,
    id: announcementKey,
    allowClose = true,
    isPreview = false,
  } = props;
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
            "sm:items-start",
            "text-gray-11 dark:text-gray-12",
            "text-[14px]",
            className
          )}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="flex flex-col w-full sm:max-w-[75%] gap-y-1 items-start flex-wrap">
            <Text>
              <span className="mr-1">{"📢"}</span>
              <span className="font-bold mr-1">{title}</span>
            </Text>
            <Text>{content}</Text>
          </div>
          {allowClose ? (
            <div className="w-full flex flex-row justify-end gap-x-2 items-center sm:w-fit sm:min-w-[25%]">
              <Button
                variant="ghost"
                className="text-gray-10 dark:text-gray-11 cursor-pointer text-[12px] transition-all ease-in-out"
                onClick={() => {
                  if (isPreview) {
                    return;
                  }
                  localStorage.setItem(localStorageKey, "true");
                  setShow(false);
                }}
              >{`Don't show again`}</Button>
              <div className="w-4 h-4">
                <Cross1Icon
                  width={16}
                  height={16}
                  className="cursor-pointer ml-1 text-gray-11 hover:text-gray-12"
                  onClick={() => {
                    if (isPreview) {
                      return;
                    }
                    setShow(false);
                  }}
                />
              </div>
            </div>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

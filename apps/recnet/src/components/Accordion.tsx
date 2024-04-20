"use client";

import { TriangleRightIcon } from "@radix-ui/react-icons";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { cn } from "../utils/cn";

interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  iconClassName?: string;
  titleClassName?: string;
  contentClassName?: string;
}

export function Accordion(props: AccordionProps) {
  const {
    title,
    children,
    className,
    iconClassName,
    titleClassName,
    contentClassName,
    ...rest
  } = props;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={cn("flex flex-col items-start p-1 text-[16px]", className)}
      {...rest}
    >
      <div
        className={cn(
          "cursor-pointer",
          "flex",
          "flex-row",
          "items-center",
          "gap-x-1"
        )}
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        <TriangleRightIcon
          className={cn(
            isOpen ? "rotate-90" : "rotate-0",
            "transition-transform",
            "ease-in-out",
            "duration-200",
            "w-4 h-4",
            iconClassName
          )}
        />
        <div
          className={cn("text-sm font-semibold cursor-pointer", titleClassName)}
          onClick={() => {
            setIsOpen(!isOpen);
          }}
        >
          {title}
        </div>
      </div>
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className={cn("overflow-hidden pl-5", contentClassName)}
          >
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

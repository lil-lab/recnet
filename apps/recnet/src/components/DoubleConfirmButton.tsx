"use client";

import { Dialog, Button, Flex } from "@radix-ui/themes";
import React, { useState } from "react";

import { cn } from "@recnet/recnet-web/utils/cn";

interface DoubleConfirmButtonProps {
  onConfirm: () => Promise<void>;
  children: React.ReactNode;
  title: string;
  description: string | React.ReactNode;
  cancelButtonProps?: React.ComponentProps<typeof Button>;
  confirmButtonProps?: React.ComponentProps<typeof Button>;
}

export function DoubleConfirmButton(props: DoubleConfirmButtonProps) {
  const {
    children,
    onConfirm,
    title,
    description,
    cancelButtonProps = {},
    confirmButtonProps = {},
  } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Dialog.Root
      open={isModalOpen}
      onOpenChange={(open) => {
        setIsModalOpen(open);
      }}
    >
      <Dialog.Trigger>{children}</Dialog.Trigger>
      <Dialog.Content
        style={{ maxWidth: 450 }}
        onPointerDownOutside={(e) => {
          // disable closing dialog on outside click
          e.preventDefault();
        }}
      >
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          {description}
        </Dialog.Description>

        <Flex gap="3" mt="4" justify="end">
          <Button
            variant="outline"
            className={cn("cursor-pointer")}
            onClick={() => {
              // close dialog
              setIsModalOpen(false);
            }}
            {...cancelButtonProps}
          >
            No
          </Button>
          <Button
            variant="solid"
            color="blue"
            className={cn("cursor-pointer text-white bg-blue-10")}
            onClick={async () => {
              await onConfirm();
              setIsModalOpen(false);
            }}
            {...confirmButtonProps}
          >
            Yes
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

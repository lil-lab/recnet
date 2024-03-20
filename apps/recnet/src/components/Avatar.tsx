"use client";
import { Avatar as RadixAvatar } from "@radix-ui/themes";
import * as React from "react";

import type { User } from "@recnet/recnet-web/types/user";
import { cn } from "@recnet/recnet-web/utils/cn";

type RadixAvatarProps = React.ComponentProps<typeof RadixAvatar>;

interface AvatarProps extends Omit<RadixAvatarProps, "fallback"> {
  user: User;
  fallback?: NonNullable<React.ReactNode>;
}

function getFallbackDisplayName(user: User) {
  return user.displayName
    .split(" ")
    .map((w) => w[0])
    .join("");
}

export function Avatar(props: AvatarProps) {
  const { user, ...rest } = props;
  const { className, ...restProps } = rest;
  return (
    <RadixAvatar
      src={user.photoURL}
      className={cn("rounded-[9999px] border-[1px] border-slate-6", className)}
      fallback={getFallbackDisplayName(user)}
      {...restProps}
    />
  );
}

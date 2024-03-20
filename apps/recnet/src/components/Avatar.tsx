"use client";
import { Avatar as RadixAvatar } from "@radix-ui/themes";
import * as React from "react";

import type { User, UserPreview } from "@recnet/recnet-api-model";

import { cn } from "@recnet/recnet-web/utils/cn";

type RadixAvatarProps = React.ComponentProps<typeof RadixAvatar>;

interface AvatarProps extends Omit<RadixAvatarProps, "fallback"> {
  user: User | UserPreview;
  fallback?: NonNullable<React.ReactNode>;
}

function getFallbackDisplayName(user: User | UserPreview) {
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
      src={user.photoUrl}
      className={cn("rounded-[9999px] border-[1px] border-slate-6", className)}
      fallback={getFallbackDisplayName(user)}
      {...restProps}
    />
  );
}

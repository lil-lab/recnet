"use client";
import { Avatar as RadixAvatar } from "@radix-ui/themes";
import type { User } from "@/types/user";

function getFallbackDisplayName(user: User) {
  return user.displayName
    .split(" ")
    .map((w) => w[0])
    .join("");
}

export function Avatar(props: { user: User }) {
  const { user } = props;
  return (
    <RadixAvatar
      src={user.photoURL}
      fallback={getFallbackDisplayName(user)}
      className="rounded-[9999px] border-[1px] border-slate-6"
    />
  );
}

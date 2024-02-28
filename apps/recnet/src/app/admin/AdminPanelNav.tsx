"use client";

import { cn } from "@/utils/cn";
import { Text } from "@radix-ui/themes";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminPanelNavItem(props: { route: string; label: string }) {
  const { route, label } = props;
  const pathname = usePathname();
  const isActive = `/admin/${route}` === pathname;

  return (
    <Link href={`/admin/${route}`}>
      <div
        className={cn(
          "px-3 py-2 rounded-[999px] hover:bg-accentA-3 cursor-pointer transition-all ease-in-out duration-200",
          {
            "bg-blue-a4": isActive,
          }
        )}
      >
        {label}
      </div>
    </Link>
  );
}

export function AdminPageNavigator() {
  return (
    <div
      className={cn(
        "w-[17%]",
        "min-w-[250px]",
        `min-h-[90svh]`,
        "border-r-[1px]",
        "border-gray-6",
        "p-4",
        "hidden",
        "md:flex",
        "flex-col",
        "gap-y-4"
      )}
    >
      <div className="flex-col flex gap-y-2 w-full">
        <Text size="3" weight={"medium"} className="text-gray-12">
          Stats
        </Text>
        <div className="flex flex-col gap-y-1">
          <AdminPanelNavItem route="/stats/user-rec-stats" label="User & Rec" />
        </div>
      </div>
      <div className="flex-col flex gap-y-2 w-full">
        <Text size="3" weight={"medium"} className="text-gray-12">
          Email
        </Text>
        <div className="flex flex-col gap-y-1">
          <AdminPanelNavItem route="/email/accouncement" label="Announcement" />
        </div>
      </div>
      <div className="flex-col flex gap-y-2 w-full">
        <Text size="3" weight={"medium"} className="text-gray-12">
          Invite code
        </Text>
        <div className="flex flex-col gap-y-1">
          <AdminPanelNavItem route="/invite-code/monitor" label="Monitor" />
          <AdminPanelNavItem
            route="/invite-code/provision"
            label="Provision code"
          />
        </div>
      </div>
    </div>
  );
}

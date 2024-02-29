"use client";

import { cn } from "@/utils/cn";
import { Text } from "@radix-ui/themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext } from "react";

const AdminPanelNavContext = createContext({});

function useAdminPanelNavContext() {
  const context = useContext(AdminPanelNavContext);

  if (!context) {
    throw new Error(
      "Child components of AdminPanelNav cannot be rendered outside the AdminPanelNav component."
    );
  }

  return context;
}

function AdminPanelNav({ children }: { children: React.ReactNode }) {
  return (
    <AdminPanelNavContext.Provider value={{}}>
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
        {children}
      </div>
    </AdminPanelNavContext.Provider>
  );
}

function NavItem(props: { route: string; label: string }) {
  useAdminPanelNavContext();
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
AdminPanelNav.Item = NavItem;

function NavSection({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  useAdminPanelNavContext();

  return (
    <div className="flex-col flex gap-y-2 w-full">
      <Text size="3" weight={"medium"} className="text-gray-12">
        {label}
      </Text>
      <div className="flex flex-col gap-y-1">{children}</div>
    </div>
  );
}
AdminPanelNav.Section = NavSection;

export function AdminPanelNavbar() {
  return (
    <AdminPanelNav>
      <AdminPanelNav.Section label="Stats">
        <AdminPanelNav.Item route="stats/user-rec" label="User & Rec" />
      </AdminPanelNav.Section>
      <AdminPanelNav.Section label="Email">
        <AdminPanelNav.Item route="email/announcement" label="Announcement" />
      </AdminPanelNav.Section>
      <AdminPanelNav.Section label="Invite Code">
        <AdminPanelNav.Item route="invite-code/monitor" label="Monitor" />
        <AdminPanelNav.Item
          route="invite-code/provision"
          label="Provision code"
        />
      </AdminPanelNav.Section>
    </AdminPanelNav>
  );
}

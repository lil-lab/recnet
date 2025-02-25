"use client";

import { Text, Tooltip } from "@radix-ui/themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext } from "react";

import { cn } from "@recnet/recnet-web/utils/cn";

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
    <div
      className={cn(
        "w-[17%]",
        "min-w-[250px]",
        `min-h-[90svh]`,
        "border-r-[1px]",
        "border-gray-6",
        "hidden",
        "md:flex",
        "flex-col"
      )}
    >
      <AdminPanelNavContext.Provider value={{}}>
        <div
          className={cn(
            "p-4",
            "gap-y-4",
            "sticky",
            "flex",
            "flex-col",
            "top-[80px]"
          )}
        >
          {children}
        </div>
      </AdminPanelNavContext.Provider>
    </div>
  );
}

function NavItem(props: { route: string; label: string; wip?: boolean }) {
  useAdminPanelNavContext();
  const { route, label, wip = false } = props;
  const pathname = usePathname();
  const isActive = pathname === `/admin/${route}`;

  const ItemWrapper = ({ children }: { children: React.ReactNode }) => {
    if (wip) {
      return (
        <Tooltip content="Work in progress" side="right" arrowPadding={0}>
          {children}
        </Tooltip>
      );
    }
    return <Link href={`/admin/${route}`}>{children}</Link>;
  };

  return (
    <ItemWrapper>
      <div
        className={cn(
          "px-3 py-2 rounded-[999px] hover:bg-accentA-3 cursor-pointer transition-all ease-in-out duration-200",
          "text-gray-11",
          {
            "bg-accentA-4": isActive,
            "cursor-not-allowed": wip,
          }
        )}
      >
        {`${wip ? "🚧 " : ""}${label}`}
      </div>
    </ItemWrapper>
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
      <AdminPanelNav.Section label="Announcement">
        <AdminPanelNav.Item route="announcement/email" label="Email" wip />
        <AdminPanelNav.Item route="announcement/inapp" label="In-app" />
      </AdminPanelNav.Section>
      <AdminPanelNav.Section label="Invite Code">
        <AdminPanelNav.Item route="invite-code/monitor" label="Monitor" />
        <AdminPanelNav.Item
          route="invite-code/provision"
          label="Provision code"
        />
      </AdminPanelNav.Section>
      <AdminPanelNav.Section label="Article">
        <AdminPanelNav.Item route="article/management" label="Management" />
      </AdminPanelNav.Section>
    </AdminPanelNav>
  );
}

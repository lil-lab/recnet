import React from "react";

import { AdminPanelNavbar } from "@recnet/recnet-web/app/admin/AdminPanelNav";
import {
  WithAuthRequiredProps,
  withAuthRequired,
} from "@recnet/recnet-web/components/hoc/withAuthRequired";
import { UserRole } from "@recnet/recnet-web/constant";
import { cn } from "@recnet/recnet-web/utils/cn";

async function AdminLayout(
  props: WithAuthRequiredProps<{
    children: React.ReactNode;
  }>
) {
  const { children } = props;

  return (
    <div
      className={cn(
        "flex",
        "flex-col",
        "md:flex-row",
        "w-full",
        "h-full",
        `min-h-[90svh]`
      )}
    >
      <AdminPanelNavbar />
      <div className="p-8 w-full flex justify-center">{children}</div>
    </div>
  );
}

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const LayoutComponent = await withAuthRequired(AdminLayout, {
    prohibitedRoles: [UserRole.USER],
  });
  return <LayoutComponent>{children}</LayoutComponent>;
}

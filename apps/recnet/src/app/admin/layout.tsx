import { notFound } from "next/navigation";
import React from "react";

import { AdminPanelNavbar } from "@recnet/recnet-web/app/admin/AdminPanelNav";
import { UserRole } from "@recnet/recnet-web/constant";
import { cn } from "@recnet/recnet-web/utils/cn";
import { getUserServerSide } from "@recnet/recnet-web/utils/getUserServerSide";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUserServerSide();

  if (!user || user?.role !== UserRole.ADMIN) {
    notFound();
  }

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

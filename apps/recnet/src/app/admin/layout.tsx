import React from "react";
import { cn } from "@/utils/cn";
import { AdminPanelNavbar } from "@/app/admin/AdminPanelNav";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
      {children}
    </div>
  );
}

import React from "react";
import { cn } from "@/utils/cn";
import { AdminPanelNavbar } from "@/app/admin/AdminPanelNav";
import { notFound } from "next/navigation";
import { getUserServerSide } from "@/utils/getUserServerSide";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUserServerSide();

  if (!user || user?.role !== "admin") {
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
      {children}
    </div>
  );
}
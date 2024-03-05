"use client";

import { cn } from "@/utils/cn";
import { AdminSectionBox, AdminSectionTitle } from "@/app/admin/AdminSections";
import { useInviteCodes } from "@/hooks/useInviteCodes";

export default function InviteCodeMonitorPage() {
  const { inviteCodes } = useInviteCodes();
  console.log("inviteCodes", inviteCodes);

  return (
    <div className={cn("w-full", "md:w-[70%]", "flex", "flex-col", "gap-y-4")}>
      <div className="flex flex-col gap-y-2 w-full">
        <AdminSectionTitle description="Manage invite events and view who used the invite codes.">
          Invite Code Monitor
        </AdminSectionTitle>
        <AdminSectionBox>123</AdminSectionBox>
      </div>
    </div>
  );
}

import { Text } from "@radix-ui/themes";

import { cn } from "@recnet/recnet-web/utils/cn";

import { InviteCodeAssigningForm } from "./InviteCodeAssigningForm";

import { AdminSectionBox, AdminSectionTitle } from "../../AdminSections";

export default function InviteCodeProvision() {
  return (
    <div
      className={cn(
        "w-full",
        "sm:w-[90%]",
        "md:w-[70%]",
        "flex",
        "flex-col",
        "gap-y-4"
      )}
    >
      <div className="flex flex-col gap-y-2 w-full">
        <AdminSectionTitle description="Generate invite codes for external used. You will be the owner of the invite code if you leave the owner field empty.">
          Generate Invite Code
        </AdminSectionTitle>
        <AdminSectionBox>
          <InviteCodeAssigningForm />
        </AdminSectionBox>
        <AdminSectionTitle description="Offer new invite codes to all users.">
          Provision Invite Code
        </AdminSectionTitle>
        <AdminSectionBox>
          <Text className="text-gray-10">Work In Progress 🚧</Text>
        </AdminSectionBox>
      </div>
    </div>
  );
}

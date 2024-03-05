"use client";

import { cn } from "@/utils/cn";
import { AdminSectionBox, AdminSectionTitle } from "../../AdminSections";
import { Button, Flex, Text, TextField } from "@radix-ui/themes";
import { AtSignIcon, HashIcon } from "lucide-react";

function InviteCodeGenerateForm() {
  return (
    <form>
      <Flex className="w-full h-full gap-x-4">
        <div className="flex flex-col gap-y-2">
          <Text size="1" className="text-gray-10">
            Number of Codes
          </Text>
          <TextField.Root>
            <TextField.Slot>
              <HashIcon size="12" className="text-gray-10" />
            </TextField.Slot>
            <TextField.Input type="number" />
          </TextField.Root>
        </div>
        <div className="flex flex-col gap-y-2 w-[350px]">
          <Text size="1" className="text-gray-10">
            {`Owner's user handle`}
          </Text>
          <TextField.Root className="w-full">
            <TextField.Slot>
              <AtSignIcon size="12" className="text-gray-10" />
            </TextField.Slot>
            <TextField.Input
              placeholder="Leave empty if you want to generate for yourself."
              className="w-full"
            />
          </TextField.Root>
        </div>
        <div className="h-full flex flex-col justify-end">
          <Button variant="solid" color="blue" className="cursor-pointer">
            Generate
          </Button>
        </div>
      </Flex>
    </form>
  );
}

export default function InviteCodeProvision() {
  return (
    <div className={cn("w-full", "md:w-[70%]", "flex", "flex-col", "gap-y-4")}>
      <div className="flex flex-col gap-y-2 w-full">
        <AdminSectionTitle description="Generate invite codes for external used. You will be the owner of the invite code.">
          Generate Invite Code
        </AdminSectionTitle>
        <AdminSectionBox>
          <InviteCodeGenerateForm />
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

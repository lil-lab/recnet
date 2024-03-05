"use client";

import { cn } from "@/utils/cn";
import { AdminSectionBox, AdminSectionTitle } from "../../AdminSections";
import { Button, Flex, Text, TextField } from "@radix-ui/themes";
import { AtSignIcon, HashIcon } from "lucide-react";
import { set, z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import { generateInviteCode } from "@/server/inviteCode";
import { useAuth } from "@/app/AuthContext";
import { User, UserSchema } from "@/types/user";
import { fetchWithZod } from "@/utils/zodFetch";

const InviteCodeGenerationSchema = z.object({
  count: z.coerce.number().min(1).max(5, "Max 5 invite codes at a time"),
  owner: z.string().optional(),
});

function InviteCodeGenerateForm() {
  const { user } = useAuth();
  const [newInviteCodes, setNewInviteCodes] = useState<string[]>([]);

  const { register, handleSubmit, formState, setError } = useForm({
    resolver: zodResolver(InviteCodeGenerationSchema),
    defaultValues: {
      count: 1,
      owner: undefined,
    },
    mode: "onBlur",
  });

  return (
    <form
      onSubmit={handleSubmit(async (data, e) => {
        e?.preventDefault();
        // check if owner exists
        let owner: User | null;
        if (data.owner) {
          // check if owner exists
          try {
            const recipient = await fetchWithZod(
              UserSchema,
              `/api/userByUsername?username=${data.owner}`
            );
            owner = recipient;
          } catch (error) {
            setError("owner", {
              type: "manual",
              message: "User not found",
            });
            return;
          }
        } else {
          owner = user;
        }
        if (!owner) {
          // should never happen, for type safety
          return;
        }
        // generate invite codes
        const codes = await generateInviteCode(owner.id, data.count);
        // show modal with invite codes
        setNewInviteCodes(codes);
      })}
    >
      <Flex className="w-full h-full gap-x-4">
        <div className="flex flex-col gap-y-2">
          <Text size="1" className="text-gray-10">
            Number of Codes
          </Text>
          <TextField.Root>
            <TextField.Slot>
              <HashIcon size="12" className="text-gray-10" />
            </TextField.Slot>
            <TextField.Input type="number" {...register("count")} />
          </TextField.Root>
          {formState.errors.count ? (
            <Text size="1" color="red">
              {formState.errors.count.message}
            </Text>
          ) : null}
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
              placeholder="Optional"
              className="w-full"
              {...register("owner")}
            />
          </TextField.Root>
          {formState.errors.owner ? (
            <Text size="1" color="red">
              {formState.errors.owner.message}
            </Text>
          ) : null}
        </div>
        <div className="h-full flex flex-col gap-y-2">
          <Text size="1" className="text-gray-10 invisible">
            {`generate`}
          </Text>
          <Button
            variant="solid"
            color="blue"
            className={cn("cursor-pointer text-white", {
              "bg-blue-10": formState.isValid,
              "bg-gray-3 cursor-not-allowed":
                formState.isSubmitting || !formState.isValid,
            })}
            type="submit"
          >
            Generate
          </Button>
        </div>
      </Flex>
    </form>
  );
}

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

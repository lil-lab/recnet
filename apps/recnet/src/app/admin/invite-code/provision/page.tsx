"use client";

import { cn } from "@recnet/recnet-web/utils/cn";
import { AdminSectionBox, AdminSectionTitle } from "../../AdminSections";
import { Button, Flex, Text, TextField, Dialog } from "@radix-ui/themes";
import { AtSignIcon, HashIcon } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useAuth } from "@recnet/recnet-web/app/AuthContext";
import { CopiableInviteCode } from "@recnet/recnet-web/components/InviteCode";
import { toast } from "sonner";
import { useCopyToClipboard } from "@recnet/recnet-web/hooks/useCopyToClipboard";
import { RecNetLink as Link } from "@recnet/recnet-web/components/Link";
import { trpc } from "@recnet/recnet-web/app/_trpc/client";
import { TRPCClientError } from "@trpc/client";

const InviteCodeGenerationSchema = z.object({
  count: z.coerce.number().min(1).max(20, "Max 20 invite codes at a time"),
  owner: z.string().optional(),
});

let timer: NodeJS.Timeout | null = null;

function InviteCodeGenerateForm() {
  const { user } = useAuth();
  const [newInviteCodes, setNewInviteCodes] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { copy } = useCopyToClipboard();
  const [copied, setCopied] = useState(false);
  const generateInviteCodeMutation = trpc.generateInviteCode.useMutation();

  const { register, handleSubmit, formState, setError, setValue } = useForm({
    resolver: zodResolver(InviteCodeGenerationSchema),
    defaultValues: {
      count: 1,
      owner: undefined,
    },
    mode: "onBlur",
  });

  return (
    <>
      <form
        onSubmit={handleSubmit(async (data, e) => {
          e?.preventDefault();
          if (!user) {
            return;
          }
          const handle = data?.owner || user.handle;
          try {
            const res = await generateInviteCodeMutation.mutateAsync(
              {
                ownerHandle: handle,
                num: data.count,
              },
              {
                onError: (error) => {
                  if (
                    error instanceof TRPCClientError &&
                    error.data.code === "NOT_FOUND" &&
                    error.message === "Owner not found"
                  ) {
                    setError("owner", {
                      type: "manual",
                      message: "User not found",
                    });
                  }
                },
              }
            );
            setNewInviteCodes(res.inviteCodes);
            setIsModalOpen(true);
          } catch (error) {
            console.error(error);
          }
        })}
      >
        <Flex
          direction={{
            initial: "column",
            sm: "row",
          }}
          className="w-full h-full gap-4"
        >
          <div className="flex flex-col gap-y-2 w-full md:w-fit">
            <Text size="1" className="text-gray-10">
              Number of Codes
            </Text>
            <TextField.Root>
              <TextField.Slot>
                <HashIcon size="12" className="text-gray-10" />
              </TextField.Slot>
              <TextField.Input
                type="number"
                {...register("count", {
                  onBlur: (e) => {
                    if (e.target.value == "" || parseInt(e.target.value) < 1) {
                      setValue("count", 1, {
                        shouldValidate: true,
                      });
                    }
                  },
                })}
              />
            </TextField.Root>
            {formState.errors.count ? (
              <Text size="1" color="red">
                {formState.errors.count.message}
              </Text>
            ) : null}
          </div>
          <div className="flex flex-col gap-y-2 md:w-[350px] w-full">
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
            <Text size="1" className="text-gray-10 invisible hidden sm:block">
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
      <Dialog.Root
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setNewInviteCodes([]);
          }
          setIsModalOpen(open);
        }}
      >
        <Dialog.Content style={{ maxWidth: 450 }}>
          <Dialog.Title>Your invite codes are generated 🚀</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Share these codes with your friends to invite them to RecNet! You
            can view these codes in the{" "}
            <Link href="/admin/invite-code/monitor">Invite Code Monitor</Link>{" "}
            page.
          </Dialog.Description>

          <Flex direction="column" gap="3">
            {newInviteCodes.map((code) => (
              <CopiableInviteCode key={code} inviteCode={code} />
            ))}
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Button
              variant="outline"
              className={cn("cursor-pointer")}
              onClick={() => {
                const allCodes = newInviteCodes.join("\n");
                copy(allCodes).then(() => {
                  setCopied(true);
                  if (timer) {
                    clearTimeout(timer);
                  }
                  timer = setTimeout(() => {
                    setCopied(false);
                  }, 5000);
                });
                toast.success("Copied all invite codes to clipboard");
              }}
            >
              {copied ? "Copied" : "Copy All"}
            </Button>
            <Dialog.Close>
              <Button className="bg-blue-10 text-white cursor-pointer">
                Done
              </Button>
            </Dialog.Close>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </>
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

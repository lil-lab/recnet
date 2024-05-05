"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Flex, Text, TextField, Dialog } from "@radix-ui/themes";
import { AtSignIcon, HashIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useAuth } from "@recnet/recnet-web/app/AuthContext";
import { trpc } from "@recnet/recnet-web/app/_trpc/client";
import { cn } from "@recnet/recnet-web/utils/cn";

const InviteCodeProvisionFormSchema = z.object({
  numCodes: z.coerce.number(),
  upperBound: z.coerce.number().nullable(),
});

export function InviteCodeProvisionForm() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const provisionInviteCodeMutation = trpc.provisionInviteCode.useMutation();

  const { register, handleSubmit, formState, setValue, getValues } = useForm({
    resolver: zodResolver(InviteCodeProvisionFormSchema),
    defaultValues: {
      numCodes: 1,
      upperBound: null,
    },
    mode: "onBlur",
  });

  return (
    <>
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
          <TextField.Root
            type="number"
            {...register("numCodes", {
              onBlur: (e) => {
                if (e.target.value == "" || parseInt(e.target.value) < 1) {
                  setValue("numCodes", 1, {
                    shouldValidate: true,
                  });
                }
              },
            })}
          >
            <TextField.Slot>
              <HashIcon size="12" className="text-gray-10" />
            </TextField.Slot>
          </TextField.Root>
          {formState.errors.numCodes ? (
            <Text size="1" color="red">
              {formState.errors.numCodes.message}
            </Text>
          ) : null}
        </div>
        <div className="flex flex-col gap-y-2 md:w-[350px] w-full">
          <Text size="1" className="text-gray-10">
            {`Upper Bound`}
          </Text>
          <TextField.Root
            className="w-full"
            placeholder="Optional"
            type="number"
            {...register("upperBound", {
              setValueAs: (val) => (val === "" ? null : val),
            })}
          >
            <TextField.Slot>
              <AtSignIcon size="12" className="text-gray-10" />
            </TextField.Slot>
          </TextField.Root>
          {formState.errors.upperBound ? (
            <Text size="1" color="red">
              {formState.errors.upperBound.message}
            </Text>
          ) : null}
        </div>
        <div className="h-full flex flex-col gap-y-2">
          <Text size="1" className="text-gray-10 invisible hidden sm:block">
            {`generate`}
          </Text>
          <Dialog.Root
            open={isModalOpen}
            onOpenChange={(open) => {
              setIsModalOpen(open);
            }}
          >
            <Dialog.Trigger>
              <Button
                variant="solid"
                color="blue"
                className={cn("cursor-pointer text-white", {
                  "bg-blue-10": formState.isValid,
                  "bg-gray-3 cursor-not-allowed": !formState.isValid,
                })}
                loading={formState.isSubmitting}
              >
                Generate
              </Button>
            </Dialog.Trigger>
            <Dialog.Content
              style={{ maxWidth: 450 }}
              onPointerDownOutside={(e) => {
                // disable closing dialog on outside click
                e.preventDefault();
              }}
            >
              <Dialog.Title>Confirm to provision invite codes</Dialog.Title>
              <Dialog.Description size="2" mb="4">
                Are you sure you want to generate {getValues("numCodes")} invite
                code{getValues("numCodes") === 1 ? "" : "s"} for all users{" "}
                {`${
                  getValues("upperBound") === null
                    ? ""
                    : `unless they have more than ${getValues("upperBound")} invite code${
                        getValues("upperBound") === "1" ? "" : "s"
                      }`
                }?`}
              </Dialog.Description>

              <Flex gap="3" mt="4" justify="end">
                <Button
                  variant="outline"
                  className={cn("cursor-pointer")}
                  onClick={() => {
                    // close dialog
                    setIsModalOpen(false);
                  }}
                  disabled={formState.isSubmitting}
                >
                  No
                </Button>
                <Button
                  variant="solid"
                  color="blue"
                  className={cn("cursor-pointer text-white bg-blue-10")}
                  loading={formState.isSubmitting}
                  onClick={handleSubmit(async (data, e) => {
                    e?.preventDefault();
                    if (!user) {
                      return;
                    }
                    // validate data
                    const res = InviteCodeProvisionFormSchema.safeParse(data);
                    if (!res.success) {
                      toast.error("Invalid input");
                      return;
                    }
                    try {
                      await provisionInviteCodeMutation.mutateAsync({
                        ...res.data,
                      });
                      toast.success("Invite codes provisioned successfully");
                    } catch (error) {
                      console.error(error);
                      // show error toast
                      toast.error("Failed to provision invite codes");
                    }
                    setIsModalOpen(false);
                  })}
                >
                  Yes
                </Button>
              </Flex>
            </Dialog.Content>
          </Dialog.Root>
        </div>
      </Flex>
    </>
  );
}

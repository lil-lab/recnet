"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Flex, Text, TextField } from "@radix-ui/themes";
import { HashIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useAuth } from "@recnet/recnet-web/app/AuthContext";
import { trpc } from "@recnet/recnet-web/app/_trpc/client";
import { DoubleConfirmButton } from "@recnet/recnet-web/components/DoubleConfirmButton";
import { cn } from "@recnet/recnet-web/utils/cn";

const InviteCodeProvisionFormSchema = z.object({
  numCodes: z.coerce.number().min(1).max(20),
  upperBound: z.coerce.number().nullable(),
});

export function InviteCodeProvisionForm() {
  const { user } = useAuth();
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
              <HashIcon size="12" className="text-gray-10" />
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
          <DoubleConfirmButton
            onConfirm={handleSubmit(async (data, e) => {
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
                const { codes } = await provisionInviteCodeMutation.mutateAsync(
                  {
                    ...res.data,
                  }
                );
                toast.success(
                  `${codes.length} invite codes have been provisioned successfully`
                );
              } catch (error) {
                console.error(error);
                // show error toast
                toast.error("Failed to provision invite codes");
              }
            })}
            title="Confirm to provision invite codes"
            description={`Are you sure you want to generate ${getValues("numCodes")} invite code${getValues("numCodes") === 1 ? "" : "s"} for all users${" "}
            ${`${
              getValues("upperBound") === null
                ? ""
                : `unless they have more than ${getValues("upperBound")} invite code${
                    getValues("upperBound") === "1" ? "" : "s"
                  }`
            }?`}`}
            cancelButtonProps={{
              disabled: formState.isSubmitting,
            }}
            confirmButtonProps={{
              loading: formState.isSubmitting,
            }}
          >
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
          </DoubleConfirmButton>
        </div>
      </Flex>
    </>
  );
}

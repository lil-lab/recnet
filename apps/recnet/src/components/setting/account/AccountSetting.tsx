"use client";

import { Dialog, Button, Text } from "@radix-ui/themes";
import { useRouter } from "next/navigation";

import { trpc } from "@recnet/recnet-web/app/_trpc/client";
import { DoubleConfirmButton } from "@recnet/recnet-web/components/DoubleConfirmButton";
import { logout } from "@recnet/recnet-web/firebase/auth";

export function AccountSetting() {
  const deactivateMutation = trpc.deactivate.useMutation();
  const router = useRouter();

  return (
    <div>
      <Dialog.Title>Account Setting</Dialog.Title>
      <Dialog.Description size="2" mb="4" className="text-gray-11">
        Make changes to account settings.
      </Dialog.Description>

      <Text size="4" color="red" className="block">
        Deactivate Account
      </Text>
      <Text size="1" className="text-gray-11 block">
        {
          "Your account will be deactivated and you will be logged out. You can reactivate your account by logging in again."
        }
        {
          " While your account is deactivated, your profile will be hidden from other users. You will not receive any weekly digest emails."
        }
      </Text>
      <div className="flex flex-row w-full mt-4">
        <DoubleConfirmButton
          onConfirm={async () => {
            await deactivateMutation.mutateAsync();
            await logout();
            router.replace("/");
          }}
          title="Deactivate Account"
          description="Are you sure you want to deactivate your account?"
        >
          <Button color="red" className="bg-red-10 cursor-pointer">
            Deactivate Account
          </Button>
        </DoubleConfirmButton>
      </div>
    </div>
  );
}

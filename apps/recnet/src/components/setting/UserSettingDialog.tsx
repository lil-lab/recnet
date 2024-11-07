"use client";

import { PersonIcon, Cross1Icon } from "@radix-ui/react-icons";
import { Dialog, Button, Text } from "@radix-ui/themes";
import { Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useMemo, useState, createContext, useContext } from "react";

import { trpc } from "@recnet/recnet-web/app/_trpc/client";
import { DoubleConfirmButton } from "@recnet/recnet-web/components/DoubleConfirmButton";
import { logout } from "@recnet/recnet-web/firebase/auth";
import { cn } from "@recnet/recnet-web/utils/cn";

import { ProfileEditForm } from "./profile/ProfileEditForm";

function AccountSetting() {
  const deactivateMutation = trpc.deactivate.useMutation();
  const router = useRouter();

  return (
    <div>
      <Dialog.Title>Account Setting</Dialog.Title>
      <Dialog.Description size="2" mb="4">
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

const tabs = {
  PROFILE: {
    label: "Profile",
    icon: <PersonIcon />,
    component: ProfileEditForm,
  },
  ACCOUNT: {
    label: "Account",
    icon: <Settings className="w-[15px] h-[15px]" />,
    component: AccountSetting,
  },
} as const;
type TabKey = keyof typeof tabs;

const UserSettingDialogContext = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  userHandle: string;
} | null>(null);

export function useUserSettingDialogContext() {
  const context = useContext(UserSettingDialogContext);
  if (!context) {
    throw new Error(
      "useUserSettingDialog must be used within a UserSettingDialogProvider"
    );
  }
  return context;
}

interface UserSettingDialogProps {
  handle: string;
  trigger: React.ReactNode;
}

export function UserSettingDialog(props: UserSettingDialogProps) {
  const { handle, trigger } = props;
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("PROFILE");

  const TabComponent = useMemo(() => tabs[activeTab].component, [activeTab]);

  return (
    <UserSettingDialogContext.Provider
      value={{
        open,
        setOpen,
        activeTab,
        setActiveTab,
        userHandle: handle,
      }}
    >
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger>{trigger}</Dialog.Trigger>
        <Dialog.Content
          maxWidth={{
            initial: "480px",
            md: "640px",
          }}
          className="relative"
        >
          <Dialog.Close className="absolute top-6 right-4 hidden md:block">
            <Button variant="soft" color="gray" className="cursor-pointer">
              <Cross1Icon />
            </Button>
          </Dialog.Close>
          <div className="flex flex-row gap-x-8 md:p-4">
            <div className="w-fit md:w-[25%] flex flex-col gap-y-2">
              {Object.entries(tabs).map(([key, { label }]) => (
                <div
                  key={key}
                  className={cn(
                    "py-1 px-4 rounded-2 flex gap-x-2 items-center cursor-pointer hover:bg-gray-4",
                    {
                      "bg-gray-5": key === activeTab,
                    }
                  )}
                  onClick={() => setActiveTab(key as TabKey)}
                >
                  {tabs[key as TabKey].icon}
                  <Text
                    size={{
                      initial: "1",
                      md: "2",
                    }}
                  >
                    {label}
                  </Text>
                </div>
              ))}
            </div>
            <div className="w-full h-[600px] md:h-[750px] overflow-y-auto">
              <TabComponent />
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Root>
    </UserSettingDialogContext.Provider>
  );
}

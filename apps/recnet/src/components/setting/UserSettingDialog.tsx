"use client";

import { PersonIcon, Cross1Icon } from "@radix-ui/react-icons";
import { Dialog, Button, Text } from "@radix-ui/themes";
import { Settings } from "lucide-react";
import React, { useMemo, useState, createContext, useContext } from "react";

import { cn } from "@recnet/recnet-web/utils/cn";

import { AccountSetting } from "./account/AccountSetting";
import { ProfileEditForm } from "./profile/ProfileEditForm";

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

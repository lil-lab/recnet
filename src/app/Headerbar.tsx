"use client";

import { cn } from "@/utils/cn";
import { Button, Flex, Text, TextField } from "@radix-ui/themes";
import Link from "next/link";
import { logout, useGoogleLogin } from "@/firebase/auth";
import { useAuth } from "@/app/AuthContext";
import { MagnifyingGlassIcon, Cross1Icon } from "@radix-ui/react-icons";
import { useState } from "react";

export function Headerbar() {
  const { login } = useGoogleLogin();
  const { user } = useAuth();
  const [enableSearch, setEnableSearch] = useState(false);

  const handleLogin = async () => {
    await login();
  };

  const handleLogout = async () => {
    await logout();
    window.location.reload();
  };

  return (
    <div
      className={cn(
        "flex",
        "w-full",
        `h-[64px]`,
        "justify-between",
        "px-4",
        "md:px-16",
        "py-[10px]",
        "shadow-4",
        "bg-white",
        "border-b-[1px]",
        "border-slate-8"
      )}
    >
      <Flex className="items-center" gap="4">
        <Text className={cn("text-blue-10", "font-bold")} size="8">
          RecNet
        </Text>
        <TextField.Root className="hidden md:inline-block">
          <TextField.Input placeholder="Search the users..." size="2" />
        </TextField.Root>
      </Flex>
      <Flex className="items-center" gap="4">
        <MagnifyingGlassIcon
          width="20"
          height="20"
          onClick={() => {
            setEnableSearch(!enableSearch);
          }}
          className={cn(
            {
              hidden: enableSearch,
              "inline-block": !enableSearch,
            },
            "md:hidden"
          )}
        />
        <TextField.Root
          className={cn(
            {
              hidden: !enableSearch,
              flex: enableSearch,
            },
            "transition-all",
            "ease-in-out",
            "duration-200"
          )}
        >
          <TextField.Input placeholder="Search the users..." size="2" />
          <TextField.Slot>
            <Cross1Icon
              width="16"
              height="16"
              onClick={() => {
                setEnableSearch(false);
              }}
              className={cn(
                {
                  hidden: !enableSearch,
                  "inline-block": enableSearch,
                },
                "md:hidden"
              )}
            />
          </TextField.Slot>
        </TextField.Root>
        <Link
          href="/about"
          className={cn({
            hidden: enableSearch,
            "inline-block": !enableSearch,
          })}
        >
          <Text size="3" weight="medium">
            About
          </Text>
        </Link>
        <Link
          href="/faq"
          className={cn({
            hidden: enableSearch,
            "inline-block": !enableSearch,
          })}
        >
          <Text size="3" weight="medium">
            FAQ
          </Text>
        </Link>
        {user ? (
          <Button onClick={handleLogout}>Log Out</Button>
        ) : (
          <Button onClick={handleLogin}>Log In</Button>
        )}
      </Flex>
    </div>
  );
}

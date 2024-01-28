"use client";

import { cn } from "@/utils/cn";
import {
  Avatar,
  Button,
  DropdownMenu,
  Flex,
  Text,
  TextField,
} from "@radix-ui/themes";
import Link from "next/link";
import { logout, useGoogleLogin } from "@/firebase/auth";
import { useAuth } from "@/app/AuthContext";
import { MagnifyingGlassIcon, Cross1Icon } from "@radix-ui/react-icons";
import { useState } from "react";
import { User } from "@/types/user";

function UserDropdown({ user }: { user: User }) {
  const handleLogout = async () => {
    await logout();
    window.location.reload();
  };
  console.log(user);
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Avatar
          src={user.photoURL}
          fallback={user.displayName
            .split(" ")
            .map((w) => w[0])
            .join("")}
          className="rounded-[9999px] border-[1px] border-slate-6"
        />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="center" className="mt-1 md:w-[120px]">
        <DropdownMenu.Item>
          <Link href={`/user/${user.username}`}>Profile</Link>
        </DropdownMenu.Item>
        <DropdownMenu.Item color="red" onClick={handleLogout}>
          Log out
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

export function Headerbar() {
  const { login } = useGoogleLogin();
  const { user } = useAuth();
  const [enableSearch, setEnableSearch] = useState(false);

  const handleLogin = async () => {
    await login();
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
        <Link href="/">
          <Text className={cn("text-blue-10", "font-bold")} size="8">
            RecNet
          </Text>
        </Link>
        <TextField.Root className="hidden md:flex">
          <TextField.Slot>
            <MagnifyingGlassIcon width="16" height="16" />
          </TextField.Slot>
          <TextField.Input placeholder="Search the users..." size="2" />
        </TextField.Root>
      </Flex>
      <Flex
        className="items-center"
        gap={{
          initial: "3",
          md: "5",
        }}
      >
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
          <UserDropdown user={user} />
        ) : (
          <Button onClick={handleLogin}>Log In</Button>
        )}
      </Flex>
    </div>
  );
}

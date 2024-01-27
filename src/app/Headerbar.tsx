"use client";

import { cn } from "@/utils/cn";
import { Button, Flex, Text, TextField } from "@radix-ui/themes";
import Link from "next/link";
import { loginWithProvider, logout, useGoogleProvider } from "@/firebase/auth";
import { getFirebaseAuth } from "@/firebase/client";
import { useAuth } from "@/app/AuthContext";

export function Headerbar() {
  const auth = getFirebaseAuth();
  const GoogleProvider = useGoogleProvider(auth);

  const { user } = useAuth();

  const handleLogin = async () => {
    await loginWithProvider(auth, GoogleProvider);
  };

  const handleLogout = async () => {
    await logout(auth);

    await fetch("/api/logout");
    window.location.reload();
  };

  return (
    <div
      className={cn(
        "flex",
        "w-full",
        `h-[64px]`,
        "justify-between",
        "px-16",
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
        <TextField.Root>
          <TextField.Input placeholder="Search the users..." size="2" />
        </TextField.Root>
      </Flex>
      <Flex className="items-center" gap="4">
        <Link href="/about">
          <Text size="3" weight="medium">
            About
          </Text>
        </Link>
        <Link href="/faq">
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

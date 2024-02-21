"use client";

import { cn } from "@/utils/cn";
import {
  Button,
  DropdownMenu,
  Flex,
  Kbd,
  Text,
  TextField,
} from "@radix-ui/themes";
import Link from "next/link";
import { logout, useGoogleLogin } from "@/firebase/auth";
import { useAuth } from "@/app/AuthContext";
import { MagnifyingGlassIcon, Cross1Icon } from "@radix-ui/react-icons";
import { useState, useRef, useEffect, useCallback } from "react";
import { User } from "@/types/user";
import { useRouter, usePathname } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { AnimatePresence, motion } from "framer-motion";

export function UserDropdown({ user }: { user: User }) {
  const router = useRouter();
  const handleLogout = async () => {
    await logout();
    router.push("/");
  };
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <div>
          <Avatar
            user={user}
            className="w-[28px] h-[28px] sm:w-[36px] sm:h-[36px] md:w-[40px] md:h-[40px]"
          />
        </div>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="center" className="mt-1 sm:w-[120px]">
        <DropdownMenu.Item>
          <Link href={`/${user.username}`}>Profile</Link>
        </DropdownMenu.Item>
        <DropdownMenu.Item color="red" onClick={handleLogout}>
          Log out
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

export function Headerbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { login } = useGoogleLogin();
  const { user } = useAuth();
  const [enableSearch, setEnableSearch] = useState(false);

  const [isAppleDevice, setIsAppleDevice] = useState<boolean | undefined>(
    undefined
  );
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleLogin = async () => {
    await login();
  };

  const handleSearch = useCallback(() => {
    if (pathname === "/search") {
      router.replace(`/search?q=${searchQuery}`);
    } else {
      router.push(`/search?q=${searchQuery}`);
    }
  }, [searchQuery, router, pathname]);

  function getIsAppleDevice() {
    if (navigator === undefined || navigator.userAgent === undefined) {
      return;
    }
    return /(iPod|iPad|iPhone|Mac)/i.test(navigator.userAgent);
  }

  useEffect(() => {
    setIsAppleDevice(getIsAppleDevice());
  }, []);

  useEffect(() => {
    const handleCk = (event: KeyboardEvent) => {
      // Ctrl+K or ⌘ K to focus on search input
      if (event.ctrlKey || event.metaKey) {
        if (event.key?.toLowerCase() === "k") {
          event.preventDefault();
          searchInputRef?.current?.focus?.();
        }
      }
      // Esc to blur search input
      else if (event.key?.toLowerCase() === "escape") {
        event.preventDefault();
        searchInputRef?.current?.blur?.();
      }
    };

    window.addEventListener("keydown", handleCk);
    return () => {
      window.removeEventListener("keydown", handleCk);
    };
  }, []);

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
        "border-slate-8",
        "sticky",
        "top-0"
      )}
    >
      <Flex className="items-center" gap="4">
        <Link href={user ? "/feeds" : "/"}>
          <Text className={cn("text-blue-10", "font-bold")} size="8">
            RecNet
          </Text>
        </Link>
        <TextField.Root className="hidden sm:flex">
          <TextField.Slot>
            <MagnifyingGlassIcon width="16" height="16" />
          </TextField.Slot>
          <TextField.Input
            placeholder="Search for users..."
            size="2"
            ref={searchInputRef}
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
          <TextField.Slot>
            <Kbd size="1">{isAppleDevice ? `⌘ K` : "Ctrl+K"}</Kbd>
          </TextField.Slot>
        </TextField.Root>
      </Flex>
      <Flex
        className="items-center"
        gap={{
          initial: "3",
          sm: "5",
        }}
      >
        <AnimatePresence initial={false} mode="wait">
          {!enableSearch ? (
            <motion.div
              key="search-icon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MagnifyingGlassIcon
                width="20"
                height="20"
                onClick={() => {
                  setEnableSearch(!enableSearch);
                }}
                className={cn("inline-block", "sm:hidden")}
              />
            </motion.div>
          ) : (
            <motion.div
              key="search"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <TextField.Root
                className={cn(
                  "flex",
                  "transition-all",
                  "ease-in-out",
                  "duration-200",
                  "sm:hidden"
                )}
              >
                <TextField.Input
                  placeholder="Search for users..."
                  size="2"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                />
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
                      "sm:hidden"
                    )}
                  />
                </TextField.Slot>
              </TextField.Root>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence initial={false} mode="wait">
          {enableSearch ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          ) : (
            <motion.div
              key="about-help-group"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-row gap-x-3 sm:gap-x-5"
            >
              <Link href="/about">
                <Text size="3" weight="medium">
                  About
                </Text>
              </Link>
              <Link href="/help">
                <Text size="3" weight="medium">
                  Help
                </Text>
              </Link>
              <Link href="/all-users">
                <Text size="3" weight="medium">
                  All Users
                </Text>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="hidden md:flex">
          {pathname === "/onboard" ? (
            <Button
              color="red"
              onClick={async () => {
                await logout();
                router.push("/");
              }}
              className="cursor-pointer"
            >
              Log out
            </Button>
          ) : user ? (
            <UserDropdown user={user} />
          ) : (
            <Button onClick={handleLogin}>Log In</Button>
          )}
        </div>
      </Flex>
    </div>
  );
}

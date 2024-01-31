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
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/Avatar";

function UserDropdown({ user }: { user: User }) {
  const handleLogout = async () => {
    await logout();
    window.location.reload();
  };
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <div>
          <Avatar user={user} />
        </div>
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
    router.push(`/search?q=${searchQuery}`);
  }, [searchQuery, router]);

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
          <TextField.Input
            placeholder="Search the users..."
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
            "duration-200",
            "md:hidden"
          )}
        >
          <TextField.Input
            placeholder="Search the users..."
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

"use client";
import {
  AvatarIcon,
  Cross2Icon,
  HomeIcon,
  MagicWandIcon,
  Pencil2Icon,
} from "@radix-ui/react-icons";
import { Dialog, Text, Button, Flex, DropdownMenu } from "@radix-ui/themes";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useState } from "react";
import { toast } from "sonner";

import { trpc } from "@recnet/recnet-web/app/_trpc/client";
import { SkeletonText, Skeleton } from "@recnet/recnet-web/components/Skeleton";
import { RecArticleForm } from "@recnet/recnet-web/components/rec/RecArticleForm";
import { UserRole } from "@recnet/recnet-web/constant";
import { useGoogleLogin } from "@recnet/recnet-web/firebase/auth";
import { cn } from "@recnet/recnet-web/utils/cn";

import { useAuth } from "./AuthContext";
import { UserDropdown } from "./Headerbar";

import { RecForm } from "../components/rec/RecForm";

function RecFormContent(props: { setOpen: (open: boolean) => void }) {
  const { setOpen } = props;
  const { user } = useAuth();
  const { data, isPending, isFetching } = trpc.getUpcomingRec.useQuery();
  const rec = data?.rec ?? null;

  if (!user) {
    // this case should never happen, just for type narrowing
    toast("Please login to create a rec");
    return null;
  }

  if (isPending || isFetching) {
    return (
      <div className={cn("flex", "flex-col", "gap-y-3")}>
        <SkeletonText size="2" className="w-[100px]" />
        <SkeletonText size="2" />
        <Flex className="w-full">
          <Button
            size={{
              initial: "2",
              lg: "3",
            }}
            className="w-full px-0"
            variant={"surface"}
            disabled
          >
            <Skeleton className="h-full w-full" />
          </Button>
        </Flex>
      </div>
    );
  }

  return (
    <div className={cn("flex", "flex-col", "gap-y-3", "relative")}>
      <Button
        variant="ghost"
        className="absolute top-0 right-0"
        color="gray"
        onClick={() => setOpen(false)}
      >
        <Cross2Icon width="24" height="24" />
      </Button>
      <Text
        size="2"
        className="text-gray-11 p-1"
        weight="medium"
        asChild={rec ? true : undefined}
      >
        {rec ? (
          <p>
            Upcoming rec:{" "}
            <span
              className="text-blue-11 cursor-pointer"
              onClick={() => {
                // open window
                window.open(rec.article.link, "_blank");
              }}
            >
              {rec.article.title}
            </span>
          </p>
        ) : (
          `Hi, ${user.displayName} 👋`
        )}
      </Text>
      <Flex className="w-full">
        {rec ? (
          <RecForm
            currentRec={rec}
            onFinish={() => {
              setOpen(false);
            }}
          />
        ) : (
          <RecArticleForm
            currentRec={rec}
            onFinish={() => {
              setOpen(false);
            }}
          />
        )}
      </Flex>
    </div>
  );
}

function AdminDropdown(props: { children: React.ReactNode }) {
  const { children } = props;
  const dropdownSectionStyle = "p-2 text-[14px] text-gray-12 font-medium";

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <div>{children}</div>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="center" className="mt-1 sm:w-[120px]">
        <div className={cn(dropdownSectionStyle)}>Stats</div>
        <DropdownMenu.Item>
          <Link href={`/admin/stats/user-rec`}>User & Rec</Link>
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <div className={cn(dropdownSectionStyle)}>Email</div>
        <DropdownMenu.Item>
          <Link href={`/admin`}>🚧 Announcement</Link>
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <div className={cn(dropdownSectionStyle)}>Invite Codes</div>
        <DropdownMenu.Item>
          <Link href={`/admin/invite-code/monitor`}>Monitor</Link>
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <Link href={`/admin/invite-code/provision`}>Provision</Link>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

function MobileNavigator() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { login } = useGoogleLogin();

  const [open, setOpen] = useState(false);
  const { theme } = useTheme();

  return (
    <div
      className={cn(
        "w-full",
        "border-t-[1px]",
        "border-slate-6",
        "flex",
        "md:hidden",
        "justify-center",
        "items-center",
        "flex-row",
        "gap-x-[20%]",
        "text-gray-8",
        "h-fit",
        "py-4",
        "bg-gradient-to-t",
        {
          "from-white": theme === "light",
          "from-black": theme === "dark",
        },
        "to-[#ffffff10]",
        "backdrop-blur-md",
        "sticky",
        "bottom-0"
      )}
    >
      <HomeIcon
        width="24"
        height="24"
        onClick={() => {
          if (pathname === "/feeds") {
            return;
          }
          router.push("/");
        }}
      />
      <Dialog.Root
        open={open}
        onOpenChange={(isOpen) => {
          if (!user) {
            toast("Please login to create a rec");
            setOpen(false);
            return;
          }
          setOpen(isOpen);
        }}
      >
        <Dialog.Trigger>
          <Pencil2Icon
            width="24"
            height="24"
            className={cn({ "text-gray-6": !user })}
            onClick={() => {
              if (!user) {
                return;
              }
              setOpen(true);
            }}
          />
        </Dialog.Trigger>
        <Dialog.Content>
          <RecFormContent setOpen={setOpen} />
        </Dialog.Content>
      </Dialog.Root>

      {user &&
      user?.role === UserRole.ADMIN &&
      pathname.startsWith("/admin") ? (
        <AdminDropdown>
          <MagicWandIcon width="24" height="24" />
        </AdminDropdown>
      ) : null}

      {user ? (
        <UserDropdown user={user} />
      ) : (
        <AvatarIcon
          width="24"
          height="24"
          onClick={() => {
            login();
          }}
        />
      )}
    </div>
  );
}

export { MobileNavigator };

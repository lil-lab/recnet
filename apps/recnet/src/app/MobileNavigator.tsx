"use client";
import { cn } from "@/utils/cn";
import {
  AvatarIcon,
  Cross2Icon,
  HomeIcon,
  MagicWandIcon,
  Pencil2Icon,
} from "@radix-ui/react-icons";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./AuthContext";
import { UserDropdown } from "./Headerbar";
import { useGoogleLogin } from "@/firebase/auth";
import { toast } from "sonner";
import { Dialog, Text, Button, Flex, DropdownMenu } from "@radix-ui/themes";
import { SkeletonText, Skeleton } from "@/components/Skeleton";
import { useState } from "react";
import { useRec } from "@/hooks/useRec";
import { getDateFromFirebaseTimestamp, getNextCutOff } from "@/utils/date";
import { RecForm } from "@/components/RecForm";
import Link from "next/link";

function RecFormContent(props: { setOpen: (open: boolean) => void }) {
  const { setOpen } = props;
  const { user, revalidateUser } = useAuth();
  const lastPostId = user?.postIds
    ? user.postIds[user.postIds.length - 1]
    : null;
  const { rec, mutate, isLoading, isValidating } = useRec(lastPostId, {
    onErrorCallback: () => {}, // After deleting rec, the hook wil fetch again and throw a not-found error due to a time difference
  });
  const hasRecInThisCycle =
    !!rec &&
    getDateFromFirebaseTimestamp(rec.cutoff).getTime() ===
      getNextCutOff().getTime();

  if (!user) {
    // this case should never happen, just for type narrowing
    toast("Please login to create a rec");
    return null;
  }

  if (isLoading || isValidating) {
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
        asChild={hasRecInThisCycle ?? undefined}
      >
        {hasRecInThisCycle ? (
          <p>
            Upcoming rec:{" "}
            <span
              className="text-blue-11 cursor-pointer"
              onClick={() => {
                // open window
                window.open(rec?.link, "_blank");
              }}
            >
              {rec?.title}
            </span>
          </p>
        ) : (
          `Hi, ${user.displayName} 👋`
        )}
      </Text>
      <Text size="2" className="text-gray-11 p-1" weight="medium">
        {hasRecInThisCycle
          ? "You can modify at anytime before this cycle ends."
          : `Any interesting read this week?`}
      </Text>
      <Flex className="w-full">
        <RecForm
          onFinish={() => {
            setOpen(false);
          }}
          currentRec={hasRecInThisCycle ? rec : null}
          user={user}
          onUpdateSuccess={async () => {
            await revalidateUser();
            mutate();
          }}
          onDeleteSuccess={async () => {
            await revalidateUser();
            await mutate();
          }}
        />
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
        "from-white",
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

      {user && user?.role === "admin" && pathname.startsWith("/admin") ? (
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

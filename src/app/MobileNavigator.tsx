"use client";
import { cn } from "@/utils/cn";
import { AvatarIcon, HomeIcon, Pencil2Icon } from "@radix-ui/react-icons";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./AuthContext";
import { UserDropdown } from "./Headerbar";
import { useGoogleLogin } from "@/firebase/auth";
import { toast } from "sonner";

function MobileNavigator() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { login } = useGoogleLogin();

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
        "backdrop-blur-sm",
        "sticky",
        "bottom-0"
      )}
    >
      <HomeIcon
        width="32"
        height="32"
        onClick={() => {
          if (pathname === "/feeds") {
            return;
          }
          router.push("/");
        }}
      />
      <Pencil2Icon
        width="32"
        height="32"
        className={cn({ "text-gray-6": !user })}
        onClick={() => {
          if (!user) {
            toast("Please login to create a rec");
          }
          // TODO: open a modal for user to create a rec
        }}
      />
      {user ? (
        <UserDropdown user={user} />
      ) : (
        <AvatarIcon
          width="32"
          height="32"
          onClick={() => {
            login();
          }}
        />
      )}
    </div>
  );
}

export { MobileNavigator };

"use client";

import { User } from "@/types/user";
import { Button } from "@radix-ui/themes";
import { useAuth } from "@/app/AuthContext";
import { useState } from "react";
import { toast } from "sonner";
import { follow, unfollow } from "@/server/user";
import { TailSpin } from "react-loader-spinner";

type RadixButtonProps = React.ComponentProps<typeof Button>;
interface FollowButtonProps extends Omit<RadixButtonProps, "variant"> {
  user: User;
}

export function FollowButton(props: FollowButtonProps) {
  const { user, ...rest } = props;
  const { user: me, revalidateUser } = useAuth();
  const isFollowing = me?.following.includes(user.seed);

  const [isLoading, setIsLoading] = useState(false);

  return (
    <Button
      className="w-full transition-all ease-in-out"
      variant={isFollowing ? "outline" : "solid"}
      onClick={async () => {
        if (!me) {
          toast.error("You must be logged in to follow someone.");
          return;
        }
        setIsLoading(true);
        if (isFollowing) {
          try {
            await unfollow(me.seed, user.seed);
            await revalidateUser();
            toast.success(`Successfully unfollowed ${user.displayName}`);
          } catch (e) {
            toast.error("Something went wrong.");
          }
        } else {
          try {
            await follow(me.seed, user.seed);
            await revalidateUser();
            toast.success(`You're following ${user.displayName}`);
          } catch (e) {
            toast.error("Something went wrong.");
          }
        }
        setIsLoading(false);
      }}
      color={me ? "blue" : "gray"}
      disabled={!!me && me.seed === user.seed}
      {...rest}
    >
      {isLoading ? (
        <TailSpin
          radius={"1"}
          visible={true}
          height="20"
          width="20"
          color={isFollowing ? "#2191FF" : "#ffffff"}
          ariaLabel="line-wave-loading"
          wrapperClass="w-fit h-fit"
        />
      ) : isFollowing ? (
        "Unfollow"
      ) : (
        "Follow"
      )}
    </Button>
  );
}

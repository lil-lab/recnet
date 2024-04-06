"use client";

import { Button } from "@radix-ui/themes";
import { useState } from "react";
import { TailSpin } from "react-loader-spinner";
import { toast } from "sonner";

import { useAuth } from "@recnet/recnet-web/app/AuthContext";
import { trpc } from "@recnet/recnet-web/app/_trpc/client";

import { UserPreview } from "@recnet/recnet-api-model";

type RadixButtonProps = React.ComponentProps<typeof Button>;
interface FollowButtonProps extends Omit<RadixButtonProps, "variant"> {
  user: UserPreview;
}

export function FollowButton(props: FollowButtonProps) {
  const { user, ...rest } = props;
  const { user: me, revalidateUser } = useAuth();
  const isFollowing = me?.following.map((up) => up.id).includes(user.id);

  const [isLoading, setIsLoading] = useState(false);
  const followMutation = trpc.follow.useMutation();
  const unfollowMutation = trpc.unfollow.useMutation();

  return (
    <Button
      className="w-full transition-all ease-in-out cursor-pointer"
      variant={isFollowing ? "outline" : "solid"}
      onClick={async () => {
        if (!me) {
          toast.error("You must be logged in to follow someone.");
          return;
        }
        setIsLoading(true);
        if (isFollowing) {
          try {
            await unfollowMutation.mutateAsync({ userId: user.id });
            await revalidateUser();
            toast.success(`Successfully unfollowed ${user.displayName}`);
          } catch (e) {
            toast.error("Something went wrong.");
          }
        } else {
          try {
            await followMutation.mutateAsync({ userId: user.id });
            await revalidateUser();
            toast.success(`You're following ${user.displayName}`);
          } catch (e) {
            toast.error("Something went wrong.");
          }
        }
        setIsLoading(false);
      }}
      color={me ? "blue" : "gray"}
      disabled={!!me && me.id === user.id}
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

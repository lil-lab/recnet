"use client";
import { Button } from "@radix-ui/themes";
import { useAuth } from "../AuthContext";
import { trpc } from "../_trpc/client";

export default function TestPage() {
  const { user, revalidateUser } = useAuth();
  const followMutation = trpc.follow.useMutation({
    onSuccess: async () => {
      await revalidateUser();
    },
  });

  const unfollowMutation = trpc.unfollow.useMutation({
    onSuccess: async () => {
      await revalidateUser();
    },
  });

  const isFollowing = user?.following.includes("6p9H8IigaM1Bs40AcNKS");
  const isLoading = followMutation.isPending || unfollowMutation.isPending;

  return (
    <div>
      <Button
        onClick={async () => {
          if (!user) {
            console.error("You must be logged in to follow someone.");
            return;
          }
          if (isFollowing) {
            await unfollowMutation.mutate({
              userId: user.id,
              targetUserId: "6p9H8IigaM1Bs40AcNKS",
            });
            console.log("unfollowed");
          } else {
            await followMutation.mutate({
              userId: user.id,
              targetUserId: "6p9H8IigaM1Bs40AcNKS",
            });
            console.log("followed");
          }
        }}
      >
        {isLoading ? "isLoading..." : isFollowing ? "Unfollow" : "Follow"}
      </Button>
    </div>
  );
}

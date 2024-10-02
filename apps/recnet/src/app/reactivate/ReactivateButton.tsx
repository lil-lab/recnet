"use client";

import { Button } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@recnet/recnet-web/app/AuthContext";
import { trpc } from "@recnet/recnet-web/app/_trpc/client";

export function ReactivateButton() {
  const [isLoading, setIsLoading] = useState(false);
  const activateMutation = trpc.activate.useMutation();
  const router = useRouter();
  const { revalidateUser } = useAuth();

  const onClick = async () => {
    setIsLoading(true);
    await activateMutation.mutateAsync();
    await revalidateUser();
    setTimeout(() => {
      toast.success("Welcome back! Redirecting...");
      router.refresh();
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Button
      className="cursor-pointer"
      disabled={isLoading}
      loading={isLoading}
      onClick={onClick}
    >
      Reactivate
    </Button>
  );
}

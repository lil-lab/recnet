"use client";
import { Button, Dialog, Flex } from "@radix-ui/themes";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useInView } from "react-intersection-observer";

import { useAuth } from "@recnet/recnet-web/app/AuthContext";
import { trpc } from "@recnet/recnet-web/app/_trpc/client";
import { LoadingBox } from "@recnet/recnet-web/components/LoadingBox";
import { UserList } from "@recnet/recnet-web/components/UserCard";
import { getDataFromInfiniteQuery } from "@recnet/recnet-web/utils/getDataFromInfiniteQuery";
import { shuffleArray } from "@recnet/recnet-web/utils/shuffle";

export function OnboardingDialog() {
  const [shouldShow, setShouldShow] = useState(false);
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const { ref: bottomRef, inView: bottomInView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    if (searchParams.get("onboarding") === "true") {
      setShouldShow(true);
    }
  }, [searchParams]);

  const { data, isPending, isFetching, fetchNextPage, hasNextPage } =
    trpc.search.useInfiniteQuery(
      {
        keyword: "",
        pageSize: 20,
      },
      {
        getNextPageParam: (lastPage, allPages) => {
          if (!lastPage.hasNext) {
            return null;
          }
          return allPages.length + 1;
        },
        initialCursor: 1,
      }
    );

  useEffect(() => {
    if (hasNextPage && bottomInView) {
      fetchNextPage();
    }
  }, [hasNextPage, bottomInView, fetchNextPage]);

  const users = useMemo(() => {
    if (!data) {
      return [];
    }
    return getDataFromInfiniteQuery(data, (page) => {
      return shuffleArray(page.users, user?.id || "");
    });
  }, [data, user]);

  if (!shouldShow) {
    return null;
  }

  return (
    <Dialog.Root open={shouldShow} onOpenChange={setShouldShow}>
      <Dialog.Content
        maxWidth={{ initial: "450px", md: "700px" }}
        style={{
          maxHeight: "75vh",
          padding: "0",
        }}
        onPointerDownOutside={(e) => {
          // Prevent the dialog from closing when clicking outside
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          // Prevent the dialog from closing when pressing escape
          e.preventDefault();
        }}
      >
        <div className="flex flex-col px-6 pb-6 pt-8">
          <Dialog.Title>Welcome to RecNet! 🎊👋</Dialog.Title>
          <Dialog.Description className="text-gray-11" size="2">
            Before you start, expand your network by following other users!
          </Dialog.Description>
        </div>
        {isPending ? (
          <LoadingBox className="h-[200px]" />
        ) : (
          <div className="p-4 h-[50vh] overflow-y-auto overflow-x-hidden">
            <UserList users={users} />
            {isFetching ? <LoadingBox className="h-[200px]" /> : null}
            <div ref={bottomRef} className="w-full h-1px bg-red-4" />
          </div>
        )}
        <Flex className="justift-end py-4 px-6 border-t-[1px] border-gray-6">
          <Button
            className="ml-auto cursor-pointer"
            onClick={() => {
              setShouldShow(false);
              router.replace(pathname);
            }}
          >
            {(user?.following ?? []).length > 0 ? "Continue" : "Skip"}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

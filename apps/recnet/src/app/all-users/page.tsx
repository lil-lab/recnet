"use client";

import { Text } from "@radix-ui/themes";
import { useMemo } from "react";

import { NotFoundBlock } from "@recnet/recnet-web/app/search/NotFound";
import { GoBackButton } from "@recnet/recnet-web/components/GoBackButton";
import { UserList } from "@recnet/recnet-web/components/UserCard";
import { cn } from "@recnet/recnet-web/utils/cn";

import { useAuth } from "../AuthContext";
import { trpc } from "../_trpc/client";
import { getShuffledUsersFromInfiniteQuery } from "../search/page";

export default function SearchResultPage() {
  const { user } = useAuth();
  const { data, isPending, fetchNextPage } = trpc.search.useInfiniteQuery(
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

  const users = useMemo(
    () => getShuffledUsersFromInfiniteQuery(data, user?.id),
    [data, user]
  );

  if (isPending) {
    // TODO: Add loading animation
    return <div>Loading...</div>;
  }

  return (
    <div
      className={cn(
        "w-full",
        "lg:w-[60%]",
        `min-h-[90svh]`,
        "flex",
        "flex-col",
        "p-8",
        "gap-y-6"
      )}
    >
      <GoBackButton />
      <Text size="7" className="text-gray-12 font-medium">{`All users`}</Text>
      {users.length === 0 ? <NotFoundBlock /> : <UserList users={users} />}
    </div>
  );
}

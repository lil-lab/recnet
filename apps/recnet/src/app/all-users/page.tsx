import { UserList } from "@recnet/recnet-web/components/UserCard";
import { cn } from "@recnet/recnet-web/utils/cn";
import { Text } from "@radix-ui/themes";
import { GoBackButton } from "@recnet/recnet-web/components/GoBackButton";
import { NotFoundBlock } from "@recnet/recnet-web/app/search/NotFound";
import { serverClient } from "../_trpc/serverClient";

export default async function SearchResultPage() {
  const { users } = await serverClient.search({ keyword: "" });

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

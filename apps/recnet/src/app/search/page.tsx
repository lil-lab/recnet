import { UserList } from "@recnet/recnet-web/components/UserCard";
import { cn } from "@recnet/recnet-web/utils/cn";
import { Text } from "@radix-ui/themes";
import { NotFoundBlock } from "./NotFound";
import { GoBackButton } from "@recnet/recnet-web/components/GoBackButton";
import { serverClient } from "../_trpc/serverClient";

export default async function SearchResultPage({
  searchParams,
}: {
  searchParams: {
    q: string;
  };
}) {
  const query = searchParams["q"];
  const { users } = await serverClient.search({ keyword: query });

  return (
    <div
      className={cn(
        "w-full",
        "lg:w-[60%]",
        "sm:w-[80%]",
        `min-h-[90svh]`,
        "flex",
        "flex-col",
        "p-8",
        "gap-y-6"
      )}
    >
      <GoBackButton />
      <Text
        size="7"
        className="text-gray-12 font-medium"
      >{`${users.length} result${users.length > 1 ? "s" : ""}`}</Text>
      {users.length === 0 ? <NotFoundBlock /> : <UserList users={users} />}
    </div>
  );
}

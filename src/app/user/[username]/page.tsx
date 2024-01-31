import { getUserByUsername } from "@/server/user";
import { UserSchema } from "@/types/user";
import { cn } from "@/utils/cn";
import { Flex } from "@radix-ui/themes";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/Avatar";

export default async function UserProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const { username } = params;
  const user = await getUserByUsername(username)
    .then((res) => UserSchema.parse(res))
    .catch((e) => {
      console.error(e);
      // redirect to 404
      notFound();
    });

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
      <Flex className="items-center p-3 gap-x-6">
        <Flex>
          <Avatar user={user} />
        </Flex>
        <Flex className="flex-grow">others</Flex>
      </Flex>
    </div>
  );
}

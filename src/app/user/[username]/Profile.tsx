"use client";

import { cn } from "@/utils/cn";
import { Button, Flex, Text, Dialog, TextField } from "@radix-ui/themes";
import { Avatar } from "@/components/Avatar";
import { HomeIcon } from "@radix-ui/react-icons";
import { RecNetLink } from "@/components/Link";
import { useAuth } from "@/app/AuthContext";
import { FollowButton } from "@/components/FollowButton";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { Skeleton, SkeletonText } from "@/components/Skeleton";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateUser } from "@/server/user";
import { getErrorMessage, isErrorWithMessage } from "@/utils/error";

const EditUserProfileSchema = z.object({
  name: z.string().min(1, "Name cannot be blank."),
  username: z
    .string()
    .min(4)
    .max(15)
    .regex(
      /^[A-Za-z0-9_]+$/,
      "Username should be between 4 to 15 characters and contain only letters (A-Z, a-z), numbers, and underscores (_)."
    ),
  affiliation: z.string().optional(),
});

function EditProfileDialog(props: { username: string }) {
  const { username } = props;
  const { mutate } = useUser(username);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { user, revalidateUser } = useAuth();

  const { register, handleSubmit, formState, setError } = useForm({
    resolver: zodResolver(EditUserProfileSchema),
    defaultValues: {
      name: user?.displayName,
      username: user?.username,
      affiliation: user?.affiliation,
    },
    mode: "onBlur",
  });

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <Button className="w-full" variant="surface">
          Edit profile
        </Button>
      </Dialog.Trigger>
      <Dialog.Content style={{ maxWidth: 450 }}>
        <form
          onSubmit={handleSubmit(async (data, e) => {
            e?.preventDefault();
            const res = EditUserProfileSchema.safeParse(data);
            if (!res.success || !user?.id) {
              // should not happen, just in case and for typescript to narrow down type
              console.error("Invalid form data.");
              return;
            }
            // if no changes, close dialog
            if (
              res.data.name === user.displayName &&
              res.data.username === user.username &&
              res.data.affiliation === user.affiliation
            ) {
              setOpen(false);
              return;
            }
            try {
              const newUserName = await updateUser(res.data, user.id);
              // revaildate user profile
              const oldUserName = user.username;
              revalidateUser();
              if (newUserName !== oldUserName) {
                // if user change username, redirect to new user profile
                router.replace(`/user/${newUserName}`);
              } else {
                mutate();
                setOpen(false);
              }
            } catch (error) {
              if (
                isErrorWithMessage(error) &&
                getErrorMessage(error) === "Username already exists."
              ) {
                setError("username", {
                  type: "manual",
                  message: "Username already exists.",
                });
              }
            }
          })}
        >
          <Dialog.Title>Edit profile</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Make changes to your profile.
          </Dialog.Description>

          <Flex direction="column" gap="3">
            <label>
              <Text as="div" size="2" mb="1" weight="medium">
                Name
              </Text>
              <TextField.Input
                placeholder="Enter your name"
                {...register("name")}
              />
              {formState.errors.name ? (
                <Text size="1" color="red">
                  {formState.errors.name.message}
                </Text>
              ) : null}
            </label>
            <label>
              <Text as="div" size="2" mb="1" weight="medium">
                User Handle
              </Text>
              <TextField.Input
                placeholder="Enter user handle"
                {...register("username")}
              />
              {formState.errors.username ? (
                <Text size="1" color="red">
                  {formState.errors.username.message}
                </Text>
              ) : null}
            </label>
            <label>
              <Text as="div" size="2" mb="1" weight="medium">
                Affiliation
              </Text>
              <TextField.Input
                placeholder="Enter your affiliation"
                {...register("affiliation")}
              />
            </label>
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              variant="solid"
              color="blue"
              className={cn({
                "bg-blue-10": formState.isValid,
                "bg-gray-5": !formState.isValid,
              })}
              type="submit"
              disabled={!formState.isValid}
            >
              Save
            </Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export function Profile(props: { username: string }) {
  const router = useRouter();
  const { username } = props;
  const { user, isLoading } = useUser(username, {
    onErrorCallback: () => {
      // redirect to 404 page
      router.replace("/404");
    },
  });
  const { user: me } = useAuth();
  const isMe = !!me && !!user && me.username === user.username;

  if (isLoading) {
    return (
      <div className={cn("flex-col", "gap-y-6", "flex")}>
        <Flex className="items-center p-3 gap-x-6">
          <Flex>
            <Skeleton className="w-[80px] h-[80px] rounded-[999px]" />
          </Flex>
          <Flex className="flex-grow flex-col justify-between h-full">
            <Flex className="p-2 items-center gap-x-4 text-gray-11">
              <SkeletonText size="6" />
            </Flex>
            <Flex className="items-center gap-x-[10px] p-1">
              <SkeletonText className="h-fit min-w-[300px]" size="3" />
            </Flex>
          </Flex>
        </Flex>
        <Flex className="w-full">
          <Button
            className="w-full p-0 overflow-hidden"
            radius="medium"
            variant="surface"
            disabled
          >
            <Skeleton className="h-full w-full" />
          </Button>
        </Flex>
      </div>
    );
  }

  if (!user) {
    router.replace("/404");
    return null;
  }

  return (
    <div className={cn("flex-col", "gap-y-6", "flex")}>
      <Flex className="items-center p-3 gap-x-6">
        <Flex>
          <Avatar user={user} className={cn("w-[80px]", "h-[80px]")} />
        </Flex>
        <Flex className="flex-grow flex-col justify-between h-full">
          <Flex className="p-2 items-center gap-x-4 text-gray-11 flex-wrap">
            <Text size="6" weight="medium">
              {user.displayName}
            </Text>
            <Text size="4">{"@" + user.username}</Text>
          </Flex>
          <Flex className="items-center gap-x-[10px] p-1 flex-wrap">
            {user.affiliation ? (
              <Flex className="items-center gap-x-1 text-gray-11">
                <HomeIcon width="16" height="16" />
                <Text size="3">{user.affiliation}</Text>
                <Text size="3" className="ml-[6px]">
                  /
                </Text>
              </Flex>
            ) : null}
            <Flex className="items-center gap-x-1 text-gray-11">
              <Text size="3">{`${user.followers.length} Follower${user.followers.length > 1 ? "s" : ""}`}</Text>
            </Flex>
            {isMe ? (
              <Flex className="items-center gap-x-1 text-gray-11">
                <Text size="3" className="mr-[6px]">
                  /
                </Text>
                <RecNetLink
                  href={`/user/following`}
                  radixLinkProps={{
                    underline: "always",
                  }}
                >
                  <Text size="3">{`${me.following.length} Following${me.following.length > 1 ? "s" : ""}`}</Text>
                </RecNetLink>
              </Flex>
            ) : null}
          </Flex>
        </Flex>
      </Flex>
      <Flex className="w-full">
        {isMe ? (
          <EditProfileDialog username={username} />
        ) : (
          <FollowButton user={user} />
        )}
      </Flex>
    </div>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { HomeIcon } from "@radix-ui/react-icons";
import { Dialog, Button, Flex, Text, TextField } from "@radix-ui/themes";
import { TRPCClientError } from "@trpc/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useFormState } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { useAuth } from "@recnet/recnet-web/app/AuthContext";
import { trpc } from "@recnet/recnet-web/app/_trpc/client";
import { Avatar } from "@recnet/recnet-web/components/Avatar";
import { FollowButton } from "@recnet/recnet-web/components/FollowButton";
import { RecNetLink } from "@recnet/recnet-web/components/Link";
import { Skeleton, SkeletonText } from "@recnet/recnet-web/components/Skeleton";
import { ErrorMessages } from "@recnet/recnet-web/constant";
import { cn } from "@recnet/recnet-web/utils/cn";

const HandleBlacklist = [
  "about",
  "api",
  "all-users",
  "feeds",
  "help",
  "onboard",
  "search",
  "user",
];

const EditUserProfileSchema = z.object({
  displayName: z.string().min(1, "Name cannot be blank."),
  handle: z
    .string()
    .min(4)
    .max(15)
    .regex(
      /^[A-Za-z0-9_]+$/,
      "User handle should be between 4 to 15 characters and contain only letters (A-Z, a-z), numbers, and underscores (_)."
    )
    .refine(
      (name) => {
        return !HandleBlacklist.includes(name);
      },
      {
        message: "User handle is not allowed.",
      }
    ),
  affiliation: z
    .string()
    .max(64, "Affiliation must contain at most 64 character(s)")
    .optional(),
});

function EditProfileDialog(props: { handle: string }) {
  const { handle } = props;
  const utils = trpc.useUtils();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { user, revalidateUser } = useAuth();

  const { register, handleSubmit, formState, setError, control } = useForm({
    resolver: zodResolver(EditUserProfileSchema),
    defaultValues: {
      displayName: user?.displayName,
      handle: user?.handle,
      affiliation: user?.affiliation,
    },
    mode: "onTouched",
  });
  const { isDirty } = useFormState({ control: control });

  const updateProfileMutation = trpc.updateUser.useMutation();

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <Button className="w-full cursor-pointer" variant="surface">
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
            if (!isDirty) {
              setOpen(false);
              return;
            }
            try {
              const oldHandle = user.handle;
              const updatedData = await updateProfileMutation.mutateAsync(
                {
                  ...res.data,
                },
                {
                  onError: (error) => {
                    if (
                      error instanceof TRPCClientError &&
                      error.data.code === "CONFLICT" &&
                      error.message === ErrorMessages.USER_HANDLE_USED
                    ) {
                      setError("handle", {
                        type: "manual",
                        message: "User handle already exists.",
                      });
                    }
                  },
                }
              );
              toast.success("Profile updated successfully!");
              // revaildate user profile
              revalidateUser();
              if (updatedData.user.handle !== oldHandle) {
                // if user change user handle, redirect to new user profile
                router.replace(`/${updatedData.user.handle}`);
              } else {
                utils.getUserByHandle.invalidate({ handle: handle });
                setOpen(false);
              }
            } catch (error) {
              console.log(error);
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
              <TextField.Root
                placeholder="Enter your name"
                {...register("displayName")}
              />
              {formState.errors.displayName ? (
                <Text size="1" color="red">
                  {formState.errors.displayName.message}
                </Text>
              ) : null}
            </label>
            <label>
              <Text as="div" size="2" mb="1" weight="medium">
                User Handle
              </Text>
              <TextField.Root
                placeholder="Enter user handle"
                {...register("handle")}
              />
              {formState.errors.handle ? (
                <Text size="1" color="red">
                  {formState.errors.handle.message}
                </Text>
              ) : null}
            </label>
            <label>
              <Text as="div" size="2" mb="1" weight="medium">
                Affiliation
              </Text>
              <TextField.Root
                placeholder="Enter your affiliation"
                {...register("affiliation")}
              />
              {formState.errors.affiliation ? (
                <Text size="1" color="red">
                  {formState.errors.affiliation.message}
                </Text>
              ) : null}
            </label>
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray" className="cursor-pointer">
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              variant="solid"
              color="blue"
              className={cn("cursor-pointer", {
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

export function Profile(props: { handle: string }) {
  const router = useRouter();
  const { handle } = props;
  const { data, isPending, isFetching } = trpc.getUserByHandle.useQuery({
    handle,
  });
  const { user: me } = useAuth();
  const isMe = !!me && !!data?.user && me.handle === data.user.handle;

  if (isPending || isFetching) {
    return (
      <div className={cn("flex-col", "gap-y-6", "flex")}>
        <Flex className="items-center p-3 gap-x-6">
          <Flex>
            <Skeleton className="w-[80px] h-[80px] rounded-[999px]" />
          </Flex>
          <Flex className="flex-grow flex-col justify-between h-full">
            <Flex className="justify-between items-center">
              <Flex className="p-2 items-center gap-x-4 text-gray-11">
                <SkeletonText size="6" />
              </Flex>
              <Flex className="w-fit">
                <Button
                  className="w-full p-0 overflow-hidden cursor-pointer"
                  radius="medium"
                  variant="surface"
                  disabled
                >
                  <SkeletonText size="3" className="h-full" />
                </Button>
              </Flex>
            </Flex>
            <Flex className="items-center gap-x-[10px] p-1">
              <SkeletonText className="h-fit min-w-[300px]" size="3" />
            </Flex>
          </Flex>
        </Flex>
      </div>
    );
  }

  if (!data?.user) {
    router.replace("/404");
    return null;
  }

  return (
    <div className={cn("flex-col", "gap-y-6", "flex")}>
      <Flex className="items-center p-3 gap-x-6">
        <Flex>
          <Avatar user={data.user} className={cn("w-[80px]", "h-[80px]")} />
        </Flex>
        <Flex className="flex-grow flex-col justify-between h-full">
          <Flex className="justify-between items-center">
            <Flex className="p-2 sm:items-center gap-x-4 text-gray-11 flex-col sm:flex-row">
              <Text
                size={{
                  initial: "5",
                  sm: "6",
                }}
                weight="medium"
              >
                {data.user.displayName}
              </Text>
              <Text
                size={{
                  initial: "3",
                  sm: "4",
                }}
              >
                {"@" + data.user.handle}
              </Text>
            </Flex>
            <Flex className="w-fit hidden md:flex">
              {isMe ? (
                <EditProfileDialog handle={data.user.handle} />
              ) : (
                <FollowButton user={data.user} />
              )}
            </Flex>
          </Flex>
          <Flex className="sm:items-center gap-x-[10px] p-2 sm:p-1 flex-wrap flex-col sm:flex-row">
            {data.user.affiliation ? (
              <Flex className="items-center gap-x-1 text-gray-11">
                <HomeIcon width="16" height="16" />
                <Text size="3">{data.user.affiliation}</Text>
                <Text size="3" className="sm:ml-[6px] hidden sm:inline-block">
                  /
                </Text>
              </Flex>
            ) : null}
            <Flex className="items-center gap-x-1 text-gray-11">
              <Text size="3">{`${data.user.numFollowers} Follower${data.user.numFollowers > 1 ? "s" : ""}`}</Text>
            </Flex>
            {isMe ? (
              <Flex className="items-center gap-x-1 text-gray-11">
                <Text size="3" className="sm:mr-[6px] hidden sm:inline-block">
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
      <Flex className="w-full md:hidden">
        {isMe ? (
          <EditProfileDialog handle={data.user.handle} />
        ) : (
          <FollowButton user={data.user} />
        )}
      </Flex>
    </div>
  );
}

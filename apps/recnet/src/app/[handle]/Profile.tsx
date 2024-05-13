"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { HomeIcon, Link2Icon } from "@radix-ui/react-icons";
import {
  Dialog,
  Button,
  Flex,
  Text,
  TextField,
  TextArea,
} from "@radix-ui/themes";
import { TRPCClientError } from "@trpc/client";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
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
    .nullable(),
  bio: z
    .string()
    .max(200, "Bio must contain at most 200 character(s)")
    .nullable(),
  url: z.string().url().nullable(),
  googleScholarLink: z.string().url().nullable(),
  semanticScholarLink: z.string().url().nullable(),
  openReviewUserName: z.string().nullable(),
});

function EditProfileDialog(props: { handle: string }) {
  const { handle } = props;
  const utils = trpc.useUtils();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { user, revalidateUser } = useAuth();

  const { register, handleSubmit, formState, setError, control, watch } =
    useForm({
      resolver: zodResolver(EditUserProfileSchema),
      defaultValues: {
        displayName: user?.displayName ?? null,
        handle: user?.handle ?? null,
        affiliation: user?.affiliation ?? null,
        bio: user?.bio ?? null,
        url: user?.url ?? null,
        googleScholarLink: user?.googleScholarLink ?? null,
        semanticScholarLink: user?.semanticScholarLink ?? null,
        openReviewUserName: user?.openReviewUserName ?? null,
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
                {...register("affiliation", {
                  setValueAs: (val) => (val === "" ? null : val),
                })}
              />
              {formState.errors.affiliation ? (
                <Text size="1" color="red">
                  {formState.errors.affiliation.message}
                </Text>
              ) : null}
            </label>
            <label>
              <Text as="div" size="2" mb="1" weight="medium">
                Personal Website
              </Text>
              <TextField.Root
                placeholder="Personal website URL(Optional)"
                {...register("url", {
                  setValueAs: (val) => (val === "" ? null : val),
                })}
              />
              {formState.errors.url ? (
                <Text size="1" color="red">
                  {formState.errors.url.message}
                </Text>
              ) : null}
            </label>
            <label>
              <Text as="div" size="2" mb="1" weight="medium">
                <RecNetLink href="https://scholar.google.com/">
                  Google Scholar
                </RecNetLink>{" "}
                Link
              </Text>
              <TextField.Root
                placeholder="Google Scholar Link(Optional)"
                {...register("googleScholarLink", {
                  setValueAs: (val) => (val === "" ? null : val),
                })}
              />
              {formState.errors.googleScholarLink ? (
                <Text size="1" color="red">
                  {formState.errors.googleScholarLink.message}
                </Text>
              ) : null}
            </label>
            <label>
              <Text as="div" size="2" mb="1" weight="medium">
                <RecNetLink href="https://www.semanticscholar.org/">
                  Semantic Scholar
                </RecNetLink>{" "}
                Link
              </Text>
              <TextField.Root
                placeholder="Semantic Scholar Link(Optional)"
                {...register("semanticScholarLink", {
                  setValueAs: (val) => (val === "" ? null : val),
                })}
              />
              {formState.errors.semanticScholarLink ? (
                <Text size="1" color="red">
                  {formState.errors.semanticScholarLink.message}
                </Text>
              ) : null}
            </label>
            <label>
              <Text as="div" size="2" mb="1" weight="medium">
                <RecNetLink href="https://openreview.net/">
                  OpenReview
                </RecNetLink>{" "}
                Username
              </Text>
              <TextField.Root
                placeholder="OpenReview Username(Optional)"
                {...register("openReviewUserName", {
                  setValueAs: (val) => (val === "" ? null : val),
                })}
              />
              {formState.errors.openReviewUserName ? (
                <Text size="1" color="red">
                  {formState.errors.openReviewUserName.message}
                </Text>
              ) : null}
            </label>
            <label>
              <Text as="div" size="2" mb="1" weight="medium">
                Bio
              </Text>
              <TextArea
                placeholder="Enter your bio"
                {...register("bio", {
                  onChange: () => {
                    if ((watch("bio")?.length ?? 0) > 200) {
                      setError("bio", {
                        type: "manual",
                        message: "Bio must contain at most 200 character(s)",
                      });
                    }
                  },
                  setValueAs: (val) => (val === "" ? null : val),
                })}
                className="h-[100px]"
              />
              <Flex className="justify-end p-1">
                {formState.errors.bio ? (
                  <Text size="1" color="red" className="mr-auto">
                    {formState.errors.bio.message}
                  </Text>
                ) : (
                  <></>
                )}
                <Text size="1" color="gray">
                  {watch("bio")?.length || 0}/200
                </Text>
              </Flex>
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

function StatDivider() {
  return <div className="w-[1px] bg-gray-6 h-[18px] flex" />;
}

export function Profile(props: { handle: string }) {
  const router = useRouter();
  const { handle } = props;
  const { data, isPending, isFetching } = trpc.getUserByHandle.useQuery({
    handle,
  });
  const { user: me } = useAuth();
  const isMe = !!me && !!data?.user && me.handle === data.user.handle;

  const userUrl = useMemo(
    () => (data?.user?.url ? new URL(data.user.url) : null),
    [data]
  );

  const userStats = useMemo(() => {
    const components: JSX.Element[] = [];
    if (data?.user) {
      const numFollowers = (
        <Flex className="items-center gap-x-1">
          <Text size="2">{`${data.user.numFollowers} Follower${data.user.numFollowers > 1 ? "s" : ""}`}</Text>
        </Flex>
      );
      components.push(numFollowers);
      components.push(<StatDivider />);
    }
    if (isMe) {
      const followings = (
        <Flex className="items-center gap-x-1">
          <RecNetLink
            href={`/user/following`}
            radixLinkProps={{
              underline: "always",
            }}
          >
            <Text size="2">{`${me.following.length} Following${me.following.length > 1 ? "s" : ""}`}</Text>
          </RecNetLink>
        </Flex>
      );
      components.push(followings);
      components.push(<StatDivider />);
    }
    if (data?.user) {
      const numRecs = (
        <Flex className="items-center gap-x-1">
          <Text size="2">{`${data.user.numRecs} Rec${data.user.numRecs > 1 ? "s" : ""}`}</Text>
        </Flex>
      );
      components.push(numRecs);
    }
    return (
      <Flex className="sm:items-center gap-x-[10px] p-2 sm:p-1 flex-wrap flex-row text-gray-11">
        {components.map((stat, index) => (
          <React.Fragment key={`user-stat-${index}`}>{stat}</React.Fragment>
        ))}
      </Flex>
    );
  }, [data, isMe, me]);

  const userInfo = useMemo(() => {
    if (!data?.user) {
      return null;
    }
    return (
      <div className="flex flex-col justify-between h-full gap-y-1">
        {data.user.bio ? (
          <Flex className="w-full p-2 sm:p-1 my-1">
            <Text size="2" className="text-gray-11 whitespace-pre-line">
              {data.user.bio}
            </Text>
          </Flex>
        ) : null}
        {data.user.affiliation ? (
          <Flex className="items-center gap-x-1 text-gray-11 px-2 sm:px-1">
            <HomeIcon width="16" height="16" />
            <Text size="2">{data.user.affiliation}</Text>
          </Flex>
        ) : null}
        {userUrl ? (
          <Flex className="items-center gap-x-1 text-gray-11 px-2 sm:px-1">
            <Link2Icon width="16" height="16" />
            <RecNetLink href={userUrl.href}>
              <Text size="2">
                {userUrl.hostname}
                {userUrl.pathname === "/" ? null : userUrl.pathname}
              </Text>
            </RecNetLink>
          </Flex>
        ) : null}
        {userStats}
      </div>
    );
  }, [data, userStats, userUrl]);

  if (isPending || isFetching) {
    return (
      <div className={cn("flex-col", "gap-y-6", "flex")}>
        <Flex className="items-start p-3 gap-x-6">
          <Flex>
            <Skeleton className="w-[80px] h-[80px] rounded-[999px]" />
          </Flex>
          <Flex className="flex-grow flex-col justify-center h-full gap-y-1">
            <SkeletonText size="4" />
            <SkeletonText size="2" />
          </Flex>
        </Flex>
        <Flex className="w-full p-2 sm:p-1 my-1 flex-col gap-y-1">
          <SkeletonText size="2" className="w-[50%]" />
          <SkeletonText size="2" className="w-[50%]" />
          <SkeletonText size="2" className="w-[50%]" />
        </Flex>
        <Flex className="items-center p-1">
          <SkeletonText className="h-fit min-w-[300px]" size="2" />
        </Flex>
        <Flex className="w-full">
          <Button
            className="w-full p-0 overflow-hidden cursor-pointer"
            radius="medium"
            variant="surface"
            disabled
          >
            <SkeletonText size="3" className="h-full w-full" />
          </Button>
        </Flex>
      </div>
    );
  }

  if (!data?.user) {
    router.replace("/404");
    return null;
  }

  return (
    <div className={cn("flex-col", "gap-y-3", "md:gap-y-6", "flex")}>
      <Flex className="items-start p-3 gap-x-6">
        <Flex>
          <Avatar user={data.user} className={cn("w-[80px]", "h-[80px]")} />
        </Flex>
        <Flex className="flex-grow flex-col justify-between h-full gap-y-1">
          <Flex className="justify-between items-center">
            <Flex className="p-2 sm:p-1 sm:items-center gap-x-4 text-gray-11 flex-col sm:flex-row">
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
                  initial: "2",
                  sm: "3",
                }}
                className="text-gray-10 font-mono"
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
          <div className="hidden sm:flex">{userInfo}</div>
        </Flex>
      </Flex>
      <div className="sm:hidden">{userInfo}</div>
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

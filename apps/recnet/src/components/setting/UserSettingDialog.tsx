"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PersonIcon, Cross1Icon } from "@radix-ui/react-icons";
import {
  Dialog,
  Button,
  Flex,
  Text,
  TextField,
  TextArea,
} from "@radix-ui/themes";
import { TRPCClientError } from "@trpc/client";
import { Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { useForm, useFormState } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { useAuth } from "@recnet/recnet-web/app/AuthContext";
import { trpc } from "@recnet/recnet-web/app/_trpc/client";
import { DoubleConfirmButton } from "@recnet/recnet-web/components/DoubleConfirmButton";
import { RecNetLink } from "@recnet/recnet-web/components/Link";
import { ErrorMessages } from "@recnet/recnet-web/constant";
import { logout } from "@recnet/recnet-web/firebase/auth";
import { cn } from "@recnet/recnet-web/utils/cn";

import { User } from "@recnet/recnet-api-model";

interface TabProps {
  onSuccess?: (user: User) => void;
  setOpen: (open: boolean) => void;
}

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

function EditProfileForm(props: TabProps) {
  const { onSuccess = () => {}, setOpen } = props;
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
    <form
      className="w-full"
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
          // fire onSuccess callback
          onSuccess(updatedData.user);
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
            <RecNetLink href="https://openreview.net/">OpenReview</RecNetLink>{" "}
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
  );
}

function AccountSetting(props: TabProps) {
  const deactivateMutation = trpc.deactivate.useMutation();
  const { onSuccess = () => {} } = props;

  return (
    <div>
      <Dialog.Title>Account Setting</Dialog.Title>
      <Dialog.Description size="2" mb="4">
        Make changes to account settings.
      </Dialog.Description>

      <Text size="4" color="red" className="block">
        Deactivate Account
      </Text>
      <Text size="1" className="text-gray-11 block">
        {
          "Your account will be deactivated and you will be logged out. You can reactivate your account by logging in again."
        }
        {
          " While your account is deactivated, your profile will be hidden from other users. You will not receive any weekly digest emails."
        }
      </Text>
      <div className="flex flex-row w-full mt-4">
        <DoubleConfirmButton
          onConfirm={async () => {
            const { user } = await deactivateMutation.mutateAsync();
            await logout();
            onSuccess(user);
          }}
          title="Deactivate Account"
          description="Are you sure you want to deactivate your account?"
        >
          <Button color="red" className="bg-red-10 cursor-pointer">
            Deactivate Account
          </Button>
        </DoubleConfirmButton>
      </div>
    </div>
  );
}

const tabs = {
  PROFILE: {
    label: "Profile",
    icon: <PersonIcon />,
    component: EditProfileForm,
  },
  ACCOUNT: {
    label: "Account",
    icon: <Settings className="w-[15px] h-[15px]" />,
    component: AccountSetting,
  },
} as const;
type TabKey = keyof typeof tabs;

interface UserSettingDialogProps {
  handle: string;
  trigger: React.ReactNode;
}

export function UserSettingDialog(props: UserSettingDialogProps) {
  const { handle, trigger } = props;
  const utils = trpc.useUtils();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const oldHandle = user?.handle;

  const tabsProps = useMemo(() => {
    return {
      ACCOUNT: {
        onSuccess: (updatedUser: User) => {
          // redirect to home page after deactivating account
          router.replace("/");
        },
        setOpen: setOpen,
      },
      PROFILE: {
        onSuccess: (updatedUser: User) => {
          if (updatedUser.handle !== oldHandle) {
            // if user change user handle, redirect to new user profile
            router.replace(`/${updatedUser.handle}`);
          } else {
            utils.getUserByHandle.invalidate({ handle: handle });
            setOpen(false);
          }
        },
        setOpen: setOpen,
      },
    };
  }, [handle, oldHandle, router, utils]);
  const [activeTab, setActiveTab] = useState<TabKey>("PROFILE");

  const TabComponent = useMemo(() => tabs[activeTab].component, [activeTab]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>{trigger}</Dialog.Trigger>
      <Dialog.Content
        maxWidth={{
          initial: "480px",
          md: "640px",
        }}
        className="relative"
      >
        <Dialog.Close className="absolute top-6 right-4 hidden md:block">
          <Button variant="soft" color="gray" className="cursor-pointer">
            <Cross1Icon />
          </Button>
        </Dialog.Close>
        <div className="flex flex-row gap-x-8 md:p-4">
          <div className="w-fit md:w-[25%] flex flex-col gap-y-2">
            {Object.entries(tabs).map(([key, { label }]) => (
              <div
                key={key}
                className={cn(
                  "py-1 px-4 rounded-2 flex gap-x-2 items-center cursor-pointer hover:bg-gray-4",
                  {
                    "bg-gray-5": key === activeTab,
                  }
                )}
                onClick={() => setActiveTab(key as TabKey)}
              >
                {tabs[key as TabKey].icon}
                <Text
                  size={{
                    initial: "1",
                    md: "2",
                  }}
                >
                  {label}
                </Text>
              </div>
            ))}
          </div>
          <div className="w-full h-[600px] md:h-[750px] overflow-y-auto">
            <TabComponent {...tabsProps[activeTab]} />
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}

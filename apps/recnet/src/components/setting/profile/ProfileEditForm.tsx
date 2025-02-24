"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  Button,
  Flex,
  Text,
  TextField,
  TextArea,
} from "@radix-ui/themes";
import { TRPCClientError } from "@trpc/client";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import React from "react";
import { useForm, useFormState } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { useAuth } from "@recnet/recnet-web/app/AuthContext";
import { trpc } from "@recnet/recnet-web/app/_trpc/client";
import { RecNetLink } from "@recnet/recnet-web/components/Link";
import { ErrorMessages } from "@recnet/recnet-web/constant";
import { cn } from "@recnet/recnet-web/utils/cn";

import { useUserSettingDialogContext } from "../UserSettingDialog";

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

const ProfileEditSchema = z.object({
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
  photoUrl: z.string().url(),
  googleScholarLink: z.string().url().nullable(),
  semanticScholarLink: z.string().url().nullable(),
  openReviewUserName: z.string().nullable(),
});

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB in bytes

export function ProfileEditForm() {
  const utils = trpc.useUtils();
  const router = useRouter();
  const { setOpen } = useUserSettingDialogContext();
  const { user, revalidateUser } = useAuth();
  const oldHandle = user?.handle;
  const pathname = usePathname();

  const { register, handleSubmit, formState, setError, control, watch } =
    useForm({
      resolver: zodResolver(ProfileEditSchema),
      defaultValues: {
        displayName: user?.displayName ?? null,
        handle: user?.handle ?? null,
        affiliation: user?.affiliation ?? null,
        bio: user?.bio ?? null,
        url: user?.url ?? null,
        photoUrl: user?.photoUrl ?? null,
        googleScholarLink: user?.googleScholarLink ?? null,
        semanticScholarLink: user?.semanticScholarLink ?? null,
        openReviewUserName: user?.openReviewUserName ?? null,
      },
      mode: "onTouched",
    });
  const { isDirty } = useFormState({ control: control });

  const updateProfileMutation = trpc.updateUser.useMutation();
  const generateUploadUrlMutation = trpc.generateUploadUrl.useMutation();
  const [isUploading, setIsUploading] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = React.useState<string | null>(
    null
  );
  const [fileError, setFileError] = React.useState<string | null>(null);

  const handleUploadS3 = async (formData: any) => {
    if (!selectedFile) return;
    try {
      setIsUploading(true);
      const uploadUrl = await generateUploadUrlMutation.mutateAsync();
      if (!uploadUrl?.url) {
        throw new Error("Error getting S3 upload URL");
      }
      const response = await fetch(uploadUrl.url, {
        method: "PUT",
        body: selectedFile,
        headers: {
          "Content-Type": selectedFile.type,
        },
      });
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      // The URL where the file will be accessible
      const fileUrl = uploadUrl.url.split("?")[0];
      // update form data directly because the form data is already passed to the handleSubmit function
      formData.photoUrl = fileUrl;
      return formData;
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Error uploading file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form
      className="w-full"
      onSubmit={handleSubmit(async (data, e) => {
        e?.preventDefault();
        const res = ProfileEditSchema.safeParse(data);
        if (!res.success || !user?.id) {
          // should not happen, just in case and for typescript to narrow down type
          console.error("Invalid form data.");
          return;
        }
        // Handle the file upload if there's a selected file
        if (selectedFile) {
          res.data = await handleUploadS3(res.data);
        }
        // if no changes, close dialog
        if (!isDirty && !selectedFile) {
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
          // revalidate cache for user profile or redirect to new user profile if handle changed
          const updatedUser = updatedData.user;
          if (updatedUser.handle !== oldHandle) {
            // if user currently at their profile page,
            // and if user change user handle, redirect to new user profile
            if (pathname === `/${oldHandle}`) {
              router.replace(`/${updatedUser.handle}`);
            }
          } else {
            utils.getUserByHandle.invalidate({ handle: oldHandle });
          }
          setOpen(false);
        } catch (error) {
          console.log(error);
        }
      })}
    >
      <Dialog.Title>Edit profile</Dialog.Title>
      <Dialog.Description size="2" mb="4" className="text-gray-11">
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
            Profile Photo
          </Text>
          <input
            type="file"
            accept="image/*"
            onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
              setFileError(null);
              if (!e.target.files || e.target.files.length === 0) {
                setSelectedFile(null);
                setPhotoPreviewUrl(null);
                return;
              }
              const file = e.target.files[0];
              if (file.size > MAX_FILE_SIZE) {
                setFileError("File size must be less than 3MB");
                setSelectedFile(null);
                setPhotoPreviewUrl(null);
                return;
              }

              setSelectedFile(file);
              // Cleanup previous preview URL if it exists
              if (photoPreviewUrl) {
                URL.revokeObjectURL(photoPreviewUrl);
              }
              // Create preview URL for the selected image
              const objectUrl = URL.createObjectURL(file);
              setPhotoPreviewUrl(objectUrl);
            }}
          />
          {fileError && (
            <Text size="1" color="red">
              {fileError}
            </Text>
          )}
          {formState.errors?.photoUrl ? (
            <Text size="1" color="red">
              {formState.errors.photoUrl.message}
            </Text>
          ) : null}
          {photoPreviewUrl && (
            <Image
              src={photoPreviewUrl}
              alt="Profile photo preview"
              width={100}
              height={100}
              style={{
                objectFit: "cover",
                borderRadius: "50%",
                marginTop: "12px",
              }}
            />
          )}
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
          disabled={!formState.isValid || isUploading}
        >
          {isUploading ? "Uploading photo..." : "Save"}
        </Button>
      </Flex>
    </form>
  );
}

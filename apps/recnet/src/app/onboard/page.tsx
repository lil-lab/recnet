"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { HomeIcon, Link2Icon } from "@radix-ui/react-icons";
import { Text, TextField, Button } from "@radix-ui/themes";
import { getAuth } from "firebase/auth";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useAuth } from "@recnet/recnet-web/app/AuthContext";
import { trpc } from "@recnet/recnet-web/app/_trpc/client";
import { RecNetLink } from "@recnet/recnet-web/components/Link";
import { ErrorMessages } from "@recnet/recnet-web/constant";
import { getFirebaseApp } from "@recnet/recnet-web/firebase/client";
import { cn } from "@recnet/recnet-web/utils/cn";
import { setRecnetCustomClaims } from "@recnet/recnet-web/utils/setRecnetCustomClaims";

const OnboardFormSchema = z.object({
  inviteCode: z.string().min(1, "Invite code cannot be blank"),
  handle: z
    .string()
    .min(4, "User handle should be at least 4 characters")
    .max(15, "User handle should be at most 15 characters")
    .regex(
      /^[A-Za-z0-9_]+$/,
      "User handle should contain only letters (A-Z, a-z), numbers, and underscores (_)."
    ),
  affiliation: z.string().nullable(),
  bio: z.string().max(200).nullable(),
  url: z.string().url().nullable(),
  googleScholarLink: z.string().url().nullable(),
  semanticScholarLink: z.string().url().nullable(),
  openReviewUserName: z.string().nullable(),
});

export default function OnboardPage() {
  const { revalidateUser } = useAuth();
  const { register, handleSubmit, formState, setError } = useForm({
    resolver: zodResolver(OnboardFormSchema),
    defaultValues: {
      inviteCode: "",
      handle: "",
      affiliation: null,
      bio: null,
      url: null,
      googleScholarLink: null,
      semanticScholarLink: null,
      openReviewUserName: null,
    },
    mode: "onTouched",
  });

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const checkInviteCodeValidMutation = trpc.checkInviteCodeValid.useMutation();
  const checkUserHandleValidMutation = trpc.checkUserHandleValid.useMutation();
  const createUserMutation = trpc.createUser.useMutation();

  return (
    <div className={cn("flex", "flex-col", "p-8", "gap-y-6", "text-gray-11")}>
      <Text size="6" weight="medium">
        Welcome to RecNet 👋
      </Text>
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
        >
          <Text>{message ?? "One more step to get started..."}</Text>
        </motion.div>
      </AnimatePresence>
      <form
        className="flex flex-col gap-y-3"
        onSubmit={handleSubmit(async (data, e) => {
          setIsLoading(true);
          e?.preventDefault();
          // parse data using schema
          const res = OnboardFormSchema.safeParse(data);
          if (!res.success) {
            toast.error("Invalid form data");
            setIsLoading(false);
            return;
          }
          setMessage("Validating...");
          // verify username is unique
          const { isValid: isUsernameUnique } =
            await checkUserHandleValidMutation.mutateAsync({
              handle: res.data.handle,
            });
          if (!isUsernameUnique) {
            setError(
              "handle",
              {
                type: "custom",
                message: "This handle is already taken",
              },
              {
                shouldFocus: true,
              }
            );
            setIsLoading(false);
            return;
          }
          // verify invite code is valid
          const { isValid: inviteCodeValid } =
            await checkInviteCodeValidMutation.mutateAsync({
              inviteCode: res.data.inviteCode,
            });
          if (!inviteCodeValid) {
            setError(
              "inviteCode",
              {
                type: "custom",
                message: "This invite code is invalid",
              },
              {
                shouldFocus: true,
              }
            );
            setIsLoading(false);
            return;
          }
          // create user object in db
          // mark invite code as used
          setMessage("Creating user...");
          const firebaseUser = getAuth(getFirebaseApp()).currentUser;
          if (
            !firebaseUser?.displayName ||
            !firebaseUser?.email ||
            !firebaseUser?.photoURL
          ) {
            throw new Error(ErrorMessages.USER_MISSING_FIREBASE_USER_DATA);
          }
          try {
            const { user: createdUser } = await createUserMutation.mutateAsync({
              inviteCode: res.data.inviteCode,
              handle: res.data.handle,
              affiliation: res.data.affiliation,
              displayName: firebaseUser.displayName,
              email: firebaseUser.email,
              photoUrl: firebaseUser.photoURL,
              bio: res.data.bio,
              url: res.data.url,
              googleScholarLink: res.data.googleScholarLink,
              semanticScholarLink: res.data.semanticScholarLink,
              openReviewUserName: res.data.openReviewUserName,
            });
            // set custom claims
            await setRecnetCustomClaims(createdUser.role, createdUser.id);
          } catch (error) {
            console.error(error);
            toast.error("Something went wrong. Please try again later.");
            setIsLoading(false);
            return;
          }
          // revalidate user
          await revalidateUser();
          setMessage("You are all set! Redirecting...");
          // direct to /feeds
          router.replace("/feeds");
          setIsLoading(false);
        })}
      >
        <div className="flex flex-col gap-y-1">
          <Text>Invite code</Text>
          <TextField.Root
            className="w-full"
            size="3"
            placeholder="Please enter your invite code here"
            autoFocus
            {...register("inviteCode")}
          />
          {formState.errors.inviteCode ? (
            <Text size="1" color="red">
              {`${formState.errors.inviteCode.message}`}
            </Text>
          ) : null}
        </div>
        <div className="flex flex-col gap-y-1">
          <Text>User handle</Text>
          <TextField.Root className="w-full" size="3" {...register("handle")}>
            <TextField.Slot>
              <Text size="3" weight="medium">
                @
              </Text>
            </TextField.Slot>
          </TextField.Root>
          {formState.errors.handle ? (
            <Text size="1" color="red">
              {`${formState.errors.handle.message}`}
            </Text>
          ) : null}
        </div>
        <div className="flex flex-col gap-y-1">
          <Text>Affiliation</Text>
          <TextField.Root
            className="w-full"
            size="3"
            placeholder="(Optional)"
            {...register("affiliation")}
          >
            <TextField.Slot>
              <HomeIcon width={16} height={16} />
            </TextField.Slot>
          </TextField.Root>
        </div>
        <div className="flex flex-col gap-y-1">
          <Text>Url</Text>
          <TextField.Root
            className="w-full"
            size="3"
            placeholder="(Optional)"
            {...register("url", {
              setValueAs: (value) => {
                if (value === "") {
                  // when the input is empty string, set to null to avoid url validation
                  return null;
                }
                return value;
              },
            })}
          >
            <TextField.Slot>
              <Link2Icon width={16} height={16} />
            </TextField.Slot>
          </TextField.Root>
          {formState.errors.url ? (
            <Text size="1" color="red">
              {`${formState.errors.url.message}`}
            </Text>
          ) : null}
        </div>
        <div className="flex flex-col gap-y-1">
          <Text>
            <RecNetLink href="https://scholar.google.com/">
              Google Scholar
            </RecNetLink>{" "}
            Link
          </Text>
          <TextField.Root
            className="w-full"
            size="3"
            placeholder="(Optional)"
            {...register("googleScholarLink", {
              setValueAs: (value) => {
                if (value === "") {
                  // when the input is empty string, set to null to avoid url validation
                  return null;
                }
                return value;
              },
            })}
          >
            <TextField.Slot>
              <Link2Icon width={16} height={16} />
            </TextField.Slot>
          </TextField.Root>
          {formState.errors.googleScholarLink ? (
            <Text size="1" color="red">
              {`${formState.errors.googleScholarLink.message}`}
            </Text>
          ) : null}
        </div>
        <div className="flex flex-col gap-y-1">
          <Text>
            <RecNetLink href="https://www.semanticscholar.org/">
              Semantic Scholar
            </RecNetLink>{" "}
            Link
          </Text>
          <TextField.Root
            className="w-full"
            size="3"
            placeholder="(Optional)"
            {...register("semanticScholarLink", {
              setValueAs: (value) => {
                if (value === "") {
                  // when the input is empty string, set to null to avoid url validation
                  return null;
                }
                return value;
              },
            })}
          >
            <TextField.Slot>
              <Link2Icon width={16} height={16} />
            </TextField.Slot>
          </TextField.Root>
          {formState.errors.semanticScholarLink ? (
            <Text size="1" color="red">
              {`${formState.errors.semanticScholarLink.message}`}
            </Text>
          ) : null}
        </div>
        <div className="flex flex-col gap-y-1">
          <Text>
            <RecNetLink href="https://openreview.net/">OpenReview</RecNetLink>{" "}
            Username
          </Text>
          <TextField.Root
            className="w-full"
            size="3"
            placeholder="(Optional)"
            {...register("openReviewUserName")}
          >
            <TextField.Slot>
              <Link2Icon width={16} height={16} />
            </TextField.Slot>
          </TextField.Root>
        </div>
        <Button
          variant="solid"
          color="blue"
          className={cn("cursor-pointer", {
            "bg-blue-10": formState.isValid,
            "bg-gray-5": !formState.isValid,
          })}
          type="submit"
          disabled={!formState.isValid}
          loading={isLoading}
        >
          Submit
        </Button>
      </form>
    </div>
  );
}

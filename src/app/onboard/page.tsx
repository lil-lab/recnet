"use client";
import { cn } from "@/utils/cn";
import { Button, Text, TextField } from "@radix-ui/themes";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HomeIcon } from "@radix-ui/react-icons";
import { checkInviteCodeValid, checkUsernameUnique } from "@/server/user";
import { getAuth } from "firebase/auth";
import { getFirebaseApp } from "@/firebase/client";
import { toast } from "sonner";
import { useAuth } from "@/app/AuthContext";
import { useRouter } from "next/navigation";

const OnboardFormSchema = z.object({
  inviteCode: z.string().min(1, "Invite code cannot be blank"),
  username: z
    .string()
    .min(4, "Username should be at least 4 characters")
    .max(15, "Username should be at most 15 characters")
    .regex(
      /^[A-Za-z0-9_]+$/,
      "Username should contain only letters (A-Z, a-z), numbers, and underscores (_)."
    ),
  affiliation: z.string().optional(),
});

export default function OnboardPage() {
  const { revalidateUser } = useAuth();
  const { register, handleSubmit, formState, setError } = useForm({
    resolver: zodResolver(OnboardFormSchema),
    defaultValues: {
      inviteCode: undefined,
      username: undefined,
      affiliation: undefined,
    },
    mode: "onBlur",
  });
  const router = useRouter();

  return (
    <div
      className={cn(
        "w-full",
        "sm:w-[50%]",
        "md:w-[40%]",
        `min-h-[90svh]`,
        "flex",
        "flex-col",
        "p-8",
        "gap-y-6",
        "justify-center",
        "text-gray-11"
      )}
    >
      <Text size="6" weight="medium">
        Welcome to RecNet 👋
      </Text>
      <Text>One more step to get started...</Text>
      <form
        className="flex flex-col gap-y-3"
        onSubmit={handleSubmit(async (data, e) => {
          e?.preventDefault();
          // parse data using schema
          const res = OnboardFormSchema.safeParse(data);
          if (!res.success) {
            toast.error("Invalid form data");
            return;
          }
          // verify username is unique
          const isUsernameUnique = await checkUsernameUnique(res.data.username);
          if (!isUsernameUnique) {
            setError(
              "username",
              {
                type: "custom",
                message: "This username is already taken",
              },
              {
                shouldFocus: true,
              }
            );
            return;
          }
          // verify invite code is valid
          const inviteCodeValid = await checkInviteCodeValid(
            res.data.inviteCode
          );
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
            return;
          }
          // create user object in db
          // mark invite code as used
          const firebaseUser = getAuth(getFirebaseApp()).currentUser;
          try {
            await fetch("/api/createUser", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                username: res.data.username,
                inviteCode: res.data.inviteCode,
                affiliation: res.data.affiliation,
                firebaseUser: firebaseUser,
              }),
            });
          } catch (error) {
            console.error(error);
            toast.error("Something went wrong. Please try again later.");
            return;
          }
          // revalidate user
          await revalidateUser();
          // direct to /feeds
          router.replace("/feeds");
        })}
      >
        <div className="flex flex-col gap-y-1">
          <Text>Invite code</Text>
          <TextField.Root className="w-full" size="3">
            <TextField.Input
              placeholder="Please enter your invite code here"
              autoFocus
              {...register("inviteCode")}
            />
          </TextField.Root>
          {formState.errors.inviteCode ? (
            <Text size="1" color="red">
              {formState.errors.inviteCode.message}
            </Text>
          ) : null}
        </div>
        <div className="flex flex-col gap-y-1">
          <Text>User handle</Text>
          <TextField.Root className="w-full" size="3">
            <TextField.Slot>
              <Text size="3" weight="medium">
                @
              </Text>
            </TextField.Slot>
            <TextField.Input {...register("username")} />
          </TextField.Root>
          {formState.errors.username ? (
            <Text size="1" color="red">
              {formState.errors.username.message}
            </Text>
          ) : null}
        </div>
        <div className="flex flex-col gap-y-1">
          <Text>Affiliation</Text>
          <TextField.Root className="w-full" size="3">
            <TextField.Slot>
              <HomeIcon width={16} height={16} />
            </TextField.Slot>
            <TextField.Input
              placeholder="(Optional)"
              {...register("affiliation")}
            />
          </TextField.Root>
        </div>
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
          Submit
        </Button>
      </form>
    </div>
  );
}

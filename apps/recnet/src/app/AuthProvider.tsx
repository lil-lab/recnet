"use client";

import { TRPCClientError } from "@trpc/client";
import { getAuth, onIdTokenChanged, User as FirebaseUser } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useCallback } from "react";

import { AuthContext } from "@recnet/recnet-web/app/AuthContext";
import { trpc } from "@recnet/recnet-web/app/_trpc/client";
import { getFirebaseApp } from "@recnet/recnet-web/firebase/client";
import useMount from "@recnet/recnet-web/hooks/useMount";
import { setRecnetCustomClaims } from "@recnet/recnet-web/utils/setRecnetCustomClaims";

import { User } from "@recnet/recnet-api-model";

import { ErrorMessages } from "../constant";
import { getErrorMessage } from "../utils/error";

export interface AuthProviderProps {
  serverUser: User | null;
  children: React.ReactNode;
}

export const AuthProvider: React.FunctionComponent<AuthProviderProps> = ({
  serverUser,
  children,
}) => {
  const pathname = usePathname();
  const router = useRouter();

  const utils = trpc.useUtils();
  const { data, isPending, isError, isFetching } = trpc.getMe.useQuery(
    undefined,
    {
      initialData: serverUser
        ? {
            user: serverUser,
          }
        : undefined,
    }
  );
  const user = data?.user ?? null;

  const loginMutation = trpc.login.useMutation();

  const revalidateUser = useCallback(async () => {
    await utils.getMe.invalidate();
  }, [utils.getMe]);

  const handleIdTokenChanged = useCallback(
    async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const idTokenResult = await firebaseUser.getIdTokenResult();

        // Sets authenticated user cookies
        try {
          await fetch("/api/login", {
            headers: {
              Authorization: `Bearer ${idTokenResult.token}`,
            },
          });
        } catch (e) {
          console.log(e);
        }
        try {
          // login user at api server and set custom claims
          const data = await loginMutation.mutateAsync(undefined, {
            onError: (error) => {
              if (
                error instanceof TRPCClientError &&
                error.data.code === "NOT_FOUND" &&
                error.message === ErrorMessages.USER_NOT_FOUND
              ) {
                // create user and redirect
                router.replace("/onboard");
              }
            },
          });
          await setRecnetCustomClaims(data.user.role, data.user.id);
          await revalidateUser();
        } catch (error) {
          console.log(error);
          if (
            getErrorMessage(error) === ErrorMessages.MISSING_FIREBASE_SECRET
          ) {
            // redirect to homepage?
            console.log("missing secret");
          }
        }
        return;
      }

      // Removes authenticated user cookies
      await fetch("/api/logout");
      await revalidateUser();
      router.replace("/");
    },
    [loginMutation, revalidateUser, router]
  );

  useMount(() => {
    return onIdTokenChanged(getAuth(getFirebaseApp()), handleIdTokenChanged);
  });

  useEffect(() => {
    if (user) {
      if (pathname === "/") {
        router.replace("/feeds");
      }
    }
  }, [user, pathname, router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        revalidateUser,
        isPending,
        isFetching,
        isError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getAuth, onIdTokenChanged, User as FirebaseUser } from "firebase/auth";
import { AuthContext } from "./AuthContext";
import { getFirebaseApp } from "@/firebase/client";
import { User, UserSchema } from "@/types/user";
import { fetchWithZod } from "@/utils/zodFetch";
import { usePathname, useRouter } from "next/navigation";

export interface AuthProviderProps {
  serverUser: User | null;
  children: React.ReactNode;
}

async function toUser(firebaseUser: FirebaseUser): Promise<User | null> {
  if (!firebaseUser.email) {
    return null;
  }
  return fetchWithZod(
    UserSchema,
    `/api/userByEmail?email=${firebaseUser.email}`
  );
}

export const AuthProvider: React.FunctionComponent<AuthProviderProps> = ({
  serverUser,
  children,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(serverUser);

  async function revalidateUser() {
    const firebaseUser = getAuth(getFirebaseApp()).currentUser;
    if (!firebaseUser) {
      setUser(null);
      return;
    }
    const user = await toUser(firebaseUser);
    setUser(user);
  }

  const handleIdTokenChanged = useCallback(
    async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const idTokenResult = await firebaseUser.getIdTokenResult();

        // Sets authenticated user cookies
        await fetch("/api/login", {
          headers: {
            Authorization: `Bearer ${idTokenResult.token}`,
          },
        });
        const user = await toUser(firebaseUser);
        setUser(user);
        if (pathname === "/") {
          router.replace("/feeds");
        }
        return;
      }

      // Removes authenticated user cookies
      await fetch("/api/logout");
      setUser(null);
    },
    [pathname, router]
  );

  useEffect(() => {
    return onIdTokenChanged(getAuth(getFirebaseApp()), handleIdTokenChanged);
  }, [handleIdTokenChanged]);

  return (
    <AuthContext.Provider
      value={{
        user,
        revalidateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

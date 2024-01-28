"use client";

import * as React from "react";
import { getAuth, onIdTokenChanged, User as FirebaseUser } from "firebase/auth";
import { AuthContext } from "./AuthContext";
import { getFirebaseApp } from "@/firebase/client";
import { User, UserSchema } from "@/types/user";
import { fetchWithZod } from "@/utils/zodFetch";

export interface AuthProviderProps {
  serverUser: User | null;
  children: React.ReactNode;
}

async function toUser(firebaseUser: FirebaseUser): Promise<User | null> {
  if (!firebaseUser.email) {
    return null;
  }
  return fetchWithZod(UserSchema, `/api/user?email=${firebaseUser.email}`);
}

export const AuthProvider: React.FunctionComponent<AuthProviderProps> = ({
  serverUser,
  children,
}) => {
  const [user, setUser] = React.useState(serverUser);

  async function revalidateUser() {
    const firebaseUser = getAuth(getFirebaseApp()).currentUser;
    if (!firebaseUser) {
      setUser(null);
      return;
    }
    const user = await toUser(firebaseUser);
    setUser(user);
  }

  const handleIdTokenChanged = async (firebaseUser: FirebaseUser | null) => {
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
      return;
    }

    // Removes authenticated user cookies
    await fetch("/api/logout");
    setUser(null);
  };

  React.useEffect(() => {
    return onIdTokenChanged(getAuth(getFirebaseApp()), handleIdTokenChanged);
  }, []);

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

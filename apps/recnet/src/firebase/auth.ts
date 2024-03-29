import type {
  Auth,
  AuthError,
  AuthProvider,
  User as FirebaseUser,
} from "firebase/auth";
import {
  browserPopupRedirectResolver,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  useDeviceLanguage,
} from "firebase/auth";
import { toast } from "sonner";

import { getFirebaseAuth } from "@recnet/recnet-web/firebase/client";

const CREDENTIAL_ALREADY_IN_USE_ERROR = "auth/credential-already-in-use";
export const isCredentialAlreadyInUseError = (e: AuthError) =>
  e?.code === CREDENTIAL_ALREADY_IN_USE_ERROR;

export const logout = async (): Promise<void> => {
  const auth = getFirebaseAuth();
  signOut(auth);
  // since we use next-firebase-auth-edge, need to hit the logout endpoint to clear cookies
  await fetch("/api/logout");
  toast.success("Logged out successfully");
};

export const useGoogleProvider = (auth: Auth) => {
  const provider = new GoogleAuthProvider();
  provider.addScope("profile");
  provider.addScope("email");
  useDeviceLanguage(auth);
  provider.setCustomParameters({
    display: "popup",
  });

  return provider;
};

export const loginWithProvider = async (
  auth: Auth,
  provider: AuthProvider
): Promise<FirebaseUser> => {
  const result = await signInWithPopup(
    auth,
    provider,
    browserPopupRedirectResolver
  );

  return result.user;
};

export function useGoogleLogin() {
  const auth = getFirebaseAuth();
  const GoogleProvider = useGoogleProvider(auth);

  const login = async () => {
    const id = toast.loading("Logging in...");
    await loginWithProvider(auth, GoogleProvider);
    toast.success("Welcome back!", {
      id,
    });
  };

  return { login };
}

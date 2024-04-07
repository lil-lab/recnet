"use server";
import "server-only";
import { cookies } from "next/headers";
import { getFirebaseAuth } from "next-firebase-auth-edge";
import { refreshServerCookies } from "next-firebase-auth-edge/lib/next/cookies";

import { ErrorMessages } from "@recnet/recnet-web/constant";
import { authConfig } from "@recnet/recnet-web/serverEnv";
import { getTokenServerSide } from "@recnet/recnet-web/utils/getTokenServerSide";

import { UserRole } from "@recnet/recnet-api-model";

export async function setRecnetCustomClaims(role: UserRole, userId: string) {
  const { setCustomUserClaims } = getFirebaseAuth({
    apiKey: authConfig.apiKey,
    serviceAccount: authConfig.serviceAccount,
  });
  const tokens = await getTokenServerSide();
  if (!tokens) {
    throw new Error(ErrorMessages.MISSING_FIREBASE_SECRET);
  }
  const { decodedToken } = tokens;
  const { uid } = decodedToken;
  await setCustomUserClaims(uid, {
    recnet: {
      role,
      userId,
    },
  });
  await refreshServerCookies(cookies(), {
    apiKey: authConfig.apiKey,
    serviceAccount: authConfig.serviceAccount,
    cookieName: authConfig.cookieName,
    cookieSignatureKeys: authConfig.cookieSignatureKeys,
    cookieSerializeOptions: authConfig.cookieSerializeOptions,
  });
}

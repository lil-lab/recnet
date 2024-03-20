"use server";
import "server-only";
import { getFirebaseAuth } from "next-firebase-auth-edge";

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
    throw new Error("No tokens");
  }
  const { decodedToken } = tokens;
  const { uid } = decodedToken;
  setCustomUserClaims(uid, {
    recnet: {
      role,
      userId,
    },
  });
}

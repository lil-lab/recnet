"use server";
import "server-only";
import { getFirebaseAuth } from "next-firebase-auth-edge";

import { UserRole } from "@recnet/recnet-api-model";

import { authConfig } from "../serverEnv";
import { getTokenServerSide } from "../utils/getTokenServerSide";

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

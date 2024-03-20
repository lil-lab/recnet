import "server-only";
import { cookies } from "next/headers";
import { Tokens, getTokens } from "next-firebase-auth-edge";

import { authConfig } from "@recnet/recnet-web/serverEnv";

export async function getTokenServerSide(): Promise<Tokens | null> {
  const tokens = await getTokens(cookies(), {
    apiKey: authConfig.apiKey,
    cookieName: authConfig.cookieName,
    cookieSignatureKeys: authConfig.cookieSignatureKeys,
    serviceAccount: authConfig.serviceAccount,
  });
  return tokens;
}

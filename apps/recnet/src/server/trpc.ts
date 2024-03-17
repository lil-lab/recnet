import { initTRPC } from "@trpc/server";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { Tokens, getTokens } from "next-firebase-auth-edge";
import { cookies } from "next/headers";
import { authConfig } from "@recnet/recnet-web/serverEnv";

interface Context {
  tokens: Tokens | null;
}

export const createContext = async (
  opts?: CreateNextContextOptions
): Promise<Context> => {
  const tokens = await getTokens(cookies(), {
    apiKey: authConfig.apiKey,
    cookieName: authConfig.cookieName,
    cookieSignatureKeys: authConfig.cookieSignatureKeys,
    serviceAccount: authConfig.serviceAccount,
  });
  return {
    tokens,
  };
};

const trpc = initTRPC.context<Context>().create();
export const {
  router,
  procedure: publicProcedure,
  createCallerFactory,
  mergeRouters,
} = trpc;

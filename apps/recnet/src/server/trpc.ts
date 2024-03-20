import { initTRPC } from "@trpc/server";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { Tokens } from "next-firebase-auth-edge";

import { getTokenServerSide } from "@recnet/recnet-web/utils/getTokenServerSide";

interface Context {
  tokens: Tokens | null;
}

export const createContext = async (
  opts?: CreateNextContextOptions
): Promise<Context> => {
  const tokens = await getTokenServerSide();
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

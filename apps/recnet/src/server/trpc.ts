import { initTRPC } from "@trpc/server";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import axios, { AxiosInstance } from "axios";
import { Tokens } from "next-firebase-auth-edge";

import { getTokenServerSide } from "@recnet/recnet-web/utils/getTokenServerSide";

import { serverEnv } from "../serverEnv";

interface Context {
  tokens: Tokens | null;
  recnetApi: AxiosInstance;
}

export const createContext = async (
  opts?: CreateNextContextOptions
): Promise<Context> => {
  const tokens = await getTokenServerSide();
  const recnetApi = axios.create({
    baseURL: serverEnv.RECNET_API_ENDPOINT,
  });
  return {
    tokens,
    recnetApi,
  };
};

const trpc = initTRPC.context<Context>().create();
export const {
  router,
  procedure: publicProcedure,
  createCallerFactory,
  mergeRouters,
} = trpc;

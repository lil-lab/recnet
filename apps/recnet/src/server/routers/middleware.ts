import { TRPCError } from "@trpc/server";
import axios from "axios";
import { Tokens } from "next-firebase-auth-edge";
import { z } from "zod";

import { ErrorMessages, UserRole } from "@recnet/recnet-web/constant";
import { serverEnv } from "@recnet/recnet-web/serverEnv";
import { getTokenServerSide } from "@recnet/recnet-web/utils/getTokenServerSide";

import {
  recnetJwtPayloadSchema,
  firebaseJwtPayloadSchema,
} from "@recnet/recnet-jwt";

import { userSchema } from "@recnet/recnet-api-model";

import { publicProcedure } from "../trpc";

/**
 * @returns User: User
 *
 * Use the tokens in cookies to get the user from the recnet api
 * Throw error if not authenticated (no tokens in cookies)
 * Note: Internal function and used in trpc middlewares or procedures
 */
export async function getUserByTokens() {
  const tokens = await getTokenServerSide();
  if (!tokens) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: ErrorMessages.MISSING_FIREBASE_SECRET,
    });
  }
  const recnetApi = createRecnetApiInstanceWithToken(tokens);
  const { data } = await recnetApi.get("/users/me");
  return userSchema.parse(data.user);
}

/**
 * @returns recnetApiInstance: AxiosInstance
 *
 * Note: Internal function and used in trpc middlewares or procedures
 */
function createRecnetApiInstanceWithToken(tokens: Tokens) {
  const { token } = tokens;
  return axios.create({
    baseURL: serverEnv.RECNET_API_ENDPOINT,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export const publicApiProcedure = publicProcedure.use(async (opts) => {
  const tokens = await getTokenServerSide();

  return opts.next({
    ctx: {
      ...opts.ctx,
      tokens,
    },
  });
});

export const checkFirebaseJWTProcedure = publicProcedure.use(async (opts) => {
  const tokens = await getTokenServerSide();
  const parseRes = firebaseJwtPayloadSchema.safeParse(tokens?.decodedToken);
  if (!tokens || !parseRes.success) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: ErrorMessages.MISSING_FIREBASE_SECRET,
    });
  }
  const recnetApiInstance = createRecnetApiInstanceWithToken(tokens);

  return opts.next({
    ctx: {
      ...opts.ctx,
      tokens,
      recnetApi: recnetApiInstance,
    },
  });
});

const recnetTokenSchema = z.object({
  token: z.string(),
  decodedToken: recnetJwtPayloadSchema,
});
export const checkRecnetJWTProcedure = publicProcedure.use(async (opts) => {
  const tokens = await getTokenServerSide();
  const parseRes = recnetTokenSchema.safeParse(tokens);
  if (!tokens || !parseRes.success) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: ErrorMessages.MISSING_RECNET_SECRET,
    });
  }
  const user = await getUserByTokens();
  const recnetApiInstance = createRecnetApiInstanceWithToken(tokens);

  return opts.next({
    ctx: {
      ...opts.ctx,
      tokens: parseRes.data,
      user: user,
      recnetApi: recnetApiInstance,
    },
  });
});

export const checkIsAdminProcedure = publicProcedure.use(async (opts) => {
  const tokens = await getTokenServerSide();
  const parseRes = recnetJwtPayloadSchema.safeParse(tokens?.decodedToken);
  if (!tokens || !parseRes.success) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: ErrorMessages.MISSING_RECNET_SECRET,
    });
  }
  // check the role of the user
  if (parseRes.success) {
    const { role } = parseRes.data.recnet;
    if (role !== UserRole.ADMIN) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: ErrorMessages.NOT_ADMIN,
      });
    }
  }
  const user = await getUserByTokens();
  const recnetApiInstance = createRecnetApiInstanceWithToken(tokens);

  return opts.next({
    ctx: {
      ...opts.ctx,
      tokens: parseRes.data,
      user,
      recnetApi: recnetApiInstance,
    },
  });
});

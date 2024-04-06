import { TRPCError } from "@trpc/server";
import { AxiosInstance } from "axios";
import { Tokens } from "next-firebase-auth-edge";
import { z } from "zod";

import { ErrorMessages, UserRole } from "@recnet/recnet-web/constant";
import { getTokenServerSide } from "@recnet/recnet-web/utils/getTokenServerSide";

import {
  recnetJwtPayloadSchema,
  firebaseJwtPayloadSchema,
} from "@recnet/recnet-jwt";

import { userSchema } from "@recnet/recnet-api-model";

import { publicProcedure } from "../trpc";

/**
 * @param tokens Tokens: user tokens from next-firebase-auth-edge
 * @param recnetApi AxiosInstance: axios instance for recnet api
 * @returns User: parsed by userSchema
 *
 * Note: Internal function and used in trpc middlewares or procedures
 */
export async function getUserByTokens(
  tokens: Tokens,
  recnetApi: AxiosInstance
) {
  const { data } = await recnetApi.get("/users/me", {
    headers: {
      Authorization: `Bearer ${tokens.token}`,
    },
  });
  return userSchema.parse(data.user);
}

export const checkFirebaseJWTProcedure = publicProcedure.use(async (opts) => {
  const tokens = await getTokenServerSide();
  const parseRes = firebaseJwtPayloadSchema.safeParse(tokens?.decodedToken);
  if (!tokens || !parseRes.success) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: ErrorMessages.MISSING_FIREBASE_SECRET,
    });
  }
  return opts.next({
    ctx: {
      ...opts.ctx,
      tokens,
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
  const user = await getUserByTokens(tokens, opts.ctx.recnetApi);
  return opts.next({
    ctx: {
      ...opts.ctx,
      tokens: parseRes.data,
      user: user,
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
  const user = await getUserByTokens(tokens, opts.ctx.recnetApi);
  return opts.next({
    ctx: {
      ...opts.ctx,
      tokens: parseRes.data,
      user,
    },
  });
});

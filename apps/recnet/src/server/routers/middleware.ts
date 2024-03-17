import { getTokenServerSide } from "@recnet/recnet-web/utils/getTokenServerSide";
import { publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import {
  recnetJwtPayloadSchema,
  firebaseJwtPayloadSchema,
} from "@recnet/recnet-jwt";
import { UserRole } from "@recnet/recnet-web/constant";
import { z } from "zod";

export const checkFirebaseJWTProcedure = publicProcedure.use(async (opts) => {
  const tokens = await getTokenServerSide();
  const parseRes = firebaseJwtPayloadSchema.safeParse(tokens?.decodedToken);
  if (!tokens || !parseRes.success) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Unauthorized, missing Firebase secret",
    });
  }
  return opts.next({
    ctx: {
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
      message: "Unauthorized, missing Recnet secret",
    });
  }
  return opts.next({
    ctx: {
      tokens: parseRes.data,
    },
  });
});

export const checkIsAdminProcedure = publicProcedure.use(async (opts) => {
  const tokens = await getTokenServerSide();
  const parseRes = recnetJwtPayloadSchema.safeParse(tokens?.decodedToken);
  if (!tokens || !parseRes.success) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Unauthorized, missing Recnet secret",
    });
  }
  // check the role of the user
  if (parseRes.success) {
    const { role } = parseRes.data.recnet;
    if (role !== UserRole.ADMIN) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Unauthorized, not an admin",
      });
    }
  }
  return opts.next({
    ctx: {
      tokens,
    },
  });
});

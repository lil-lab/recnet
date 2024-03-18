import { getTokenServerSide } from "@recnet/recnet-web/utils/getTokenServerSide";
import { publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import {
  recnetJwtPayloadSchema,
  firebaseJwtPayloadSchema,
} from "@recnet/recnet-jwt";
import { UserRole } from "@recnet/recnet-web/constant";
import { z } from "zod";
import { Tokens } from "next-firebase-auth-edge";
import { userSchema, userPreviewSchema } from "@recnet/recnet-api-model";
import { db } from "@recnet/recnet-web/firebase/admin";
import { notEmpty } from "@recnet/recnet-web/utils/notEmpty";

/**
 * @param tokens Tokens: user tokens from next-firebase-auth-edge
 * @returns User: parsed by userSchema
 *
 * Note: Internal function and used in trpc middlewares
 */
async function _getUserByTokens(tokens: Tokens) {
  // REFACTOR_AFTER_MIGRATION
  const { decodedToken } = tokens;
  const email = decodedToken.email as string;

  const querySnapshot = await db
    .collection("users")
    .where("email", "==", email)
    .limit(1)
    .get();
  if (querySnapshot.empty) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User not found",
    });
  }
  // get userPreview for each following
  const userPreviews = await Promise.all(
    querySnapshot.docs[0].data().following.map(async (id: string) => {
      const unparsedUser = await db.doc(`users/${id}`).get();
      const userData = unparsedUser.data();
      if (!userData) {
        return null;
      }
      const parsedRes = userPreviewSchema.safeParse({
        id: unparsedUser.id,
        handle: userData.username,
        displayName: userData.displayName,
        photoUrl: userData.photoURL,
        affiliation: userData.affiliation || null,
        bio: userData.bio || null,
        numFollowers: userData.followers.length,
      });
      if (parsedRes.success) {
        return parsedRes.data;
      }
      return null;
    })
  );
  return userSchema.parse({
    id: querySnapshot.docs[0].id,
    handle: querySnapshot.docs[0].data().username,
    displayName: querySnapshot.docs[0].data().displayName,
    photoUrl: querySnapshot.docs[0].data().photoURL,
    affiliation: querySnapshot.docs[0].data().affiliation || null,
    bio: querySnapshot.docs[0].data().bio || null,
    numFollowers: querySnapshot.docs[0].data().followers.length,
    email: querySnapshot.docs[0].data().email,
    role: querySnapshot.docs[0].data().role ? UserRole.ADMIN : UserRole.USER,
    following: userPreviews.filter(notEmpty),
  });
}

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
  const user = await _getUserByTokens(tokens);
  return opts.next({
    ctx: {
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
  const user = await _getUserByTokens(tokens);
  return opts.next({
    ctx: {
      tokens: parseRes.data,
      user,
    },
  });
});

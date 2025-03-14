import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { ErrorMessages } from "@recnet/recnet-web/constant";

import {
  getUserMeResponseSchema,
  getUserLoginResponseSchema,
  userPreviewSchema,
  postUserFollowRequestSchema,
  deleteUserFollowParamsSchema,
  postUserValidateInviteCodeRequestSchema,
  postUserValidateHandleRequestSchema,
  getUsersParamsSchema,
  patchUserMeRequestSchema,
  patchUserMeResponseSchema,
  postUserMeRequestSchema,
  postUserMeResponseSchema,
  getStatsResponseSchema,
  patchUserMeActivateRequestSchema,
  patchUserMeActivateResponseSchema,
  userSchema,
} from "@recnet/recnet-api-model";

import {
  checkFirebaseJWTProcedure,
  checkIsAdminProcedure,
  checkRecnetJWTProcedure,
  publicApiProcedure,
  getUserByTokens,
} from "./middleware";

import { router } from "../trpc";

export const userRouter = router({
  getMe: publicApiProcedure
    .output(z.union([getUserMeResponseSchema, z.object({ user: z.null() })]))
    .query(async (opts) => {
      const { tokens } = opts.ctx;
      if (!tokens) {
        return {
          user: null,
        };
      }
      const user = await getUserByTokens();
      return {
        user,
      };
    }),
  getUserByHandle: publicApiProcedure
    .input(
      z.object({
        handle: z.string(),
      })
    )
    .output(
      z.object({
        user: userPreviewSchema.nullable(),
      })
    )
    .query(async (opts) => {
      const { handle } = opts.input;
      const { recnetApi } = opts.ctx;
      try {
        const { data } = await recnetApi.get("/users", {
          params: {
            ...getUsersParamsSchema.parse({
              handle: handle,
              page: 1,
              pageSize: 1,
            }),
          },
        });
        return {
          user: userPreviewSchema.parse(data.users[0]),
        };
      } catch (e) {
        return {
          user: null,
        };
      }
    }),
  login: checkFirebaseJWTProcedure
    .output(getUserLoginResponseSchema)
    .mutation(async (opts) => {
      const { recnetApi } = opts.ctx;
      try {
        const { data } = await recnetApi.get("/users/login");
        return getUserLoginResponseSchema.parse(data);
      } catch (e) {
        // TODO: use if else statement to catch the correct error
        // handle user first login and throw this error to redirect to the signup page
        throw new TRPCError({
          code: "NOT_FOUND",
          message: ErrorMessages.USER_NOT_FOUND,
        });
      }
    }),
  checkUserHandleValid: checkFirebaseJWTProcedure
    .input(postUserValidateHandleRequestSchema)
    .output(
      z.object({
        isValid: z.boolean(),
      })
    )
    .mutation(async (opts) => {
      const { handle } = opts.input;
      const { recnetApi } = opts.ctx;
      try {
        await recnetApi.post("/users/validate/handle", {
          handle,
        });
        return {
          isValid: true,
        };
      } catch (e) {
        return {
          isValid: false,
        };
      }
    }),
  checkInviteCodeValid: checkFirebaseJWTProcedure
    .input(postUserValidateInviteCodeRequestSchema)
    .output(
      z.object({
        isValid: z.boolean(),
      })
    )
    .mutation(async (opts) => {
      const { inviteCode } = opts.input;
      const { recnetApi } = opts.ctx;
      try {
        await recnetApi.post("/users/validate/invite-code", {
          inviteCode,
        });
        return {
          isValid: true,
        };
      } catch (e) {
        return {
          isValid: false,
        };
      }
    }),
  createUser: checkFirebaseJWTProcedure
    .input(postUserMeRequestSchema)
    .output(postUserMeResponseSchema)
    .mutation(async (opts) => {
      const { recnetApi } = opts.ctx;
      const { data } = await recnetApi.post("/users/me", {
        ...opts.input,
      });
      return postUserMeResponseSchema.parse(data);
    }),
  updateUser: checkRecnetJWTProcedure
    .input(patchUserMeRequestSchema)
    .output(patchUserMeResponseSchema)
    .mutation(async (opts) => {
      const { recnetApi } = opts.ctx;
      // Fetch original user data before updating
      const { data: originalData } = await recnetApi.get("/users/me");
      const originalUser = userSchema.parse(originalData.user);
      const originalPhotoUrl = originalUser.photoUrl;

      // Update user data
      const { data } = await recnetApi.patch("/users/me", {
        ...opts.input,
      });
      const updatedData = patchUserMeResponseSchema.parse(data);

      // Only delete the original photo if:
      // 1. There was an original photo
      // 2. A new photo is being set
      // 3. The new photo is different from the original
      if (
        originalPhotoUrl &&
        opts.input.photoUrl &&
        originalPhotoUrl !== opts.input.photoUrl
      ) {
        await recnetApi.delete("/photo-storage/photo", {
          params: {
            fileUrl: originalPhotoUrl,
          },
        });
      }

      return updatedData;
    }),
  follow: checkRecnetJWTProcedure
    .input(postUserFollowRequestSchema)
    .mutation(async (opts) => {
      const { userId } = opts.input;
      const { recnetApi } = opts.ctx;
      await recnetApi.post("/users/follow", {
        userId,
      });
    }),
  unfollow: checkRecnetJWTProcedure
    .input(deleteUserFollowParamsSchema)
    .mutation(async (opts) => {
      const { userId } = opts.input;
      const { recnetApi } = opts.ctx;
      await recnetApi.delete("/users/follow", {
        params: {
          userId,
        },
      });
    }),
  generateUploadUrl: checkRecnetJWTProcedure
    .output(z.object({ url: z.string() }))
    .mutation(async (opts) => {
      const { recnetApi } = opts.ctx;
      const { data } = await recnetApi.post("/photo-storage/upload-url");
      return {
        url: data.url,
      };
    }),
  deactivate: checkRecnetJWTProcedure
    .output(patchUserMeActivateResponseSchema)
    .mutation(async (opts) => {
      const { recnetApi } = opts.ctx;
      const { data } = await recnetApi.patch("/users/me/activate", {
        ...patchUserMeActivateRequestSchema.parse({
          isActivated: false,
        }),
      });
      return patchUserMeActivateResponseSchema.parse(data);
    }),
  activate: checkRecnetJWTProcedure
    .output(patchUserMeActivateResponseSchema)
    .mutation(async (opts) => {
      const { recnetApi } = opts.ctx;
      const { data } = await recnetApi.patch("/users/me/activate", {
        ...patchUserMeActivateRequestSchema.parse({
          isActivated: true,
        }),
      });
      return patchUserMeActivateResponseSchema.parse(data);
    }),
  getNumOfUsers: checkIsAdminProcedure
    .output(z.object({ num: z.number() }))
    .query(async (opts) => {
      const { recnetApi } = opts.ctx;
      const { data } = await recnetApi.get("/stats");
      const statsData = getStatsResponseSchema.parse(data);
      return {
        num: statsData.numUsers,
      };
    }),
});

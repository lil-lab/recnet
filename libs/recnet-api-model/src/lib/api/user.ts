import { z } from "zod";
import { userPreviewSchema, userSchema } from "../model";

// GET /users
export const getUsersParamsSchema = z.object({
  page: z.coerce.number(),
  pageSize: z.coerce.number(),
  handle: z.string().optional(),
  keyword: z.string().optional(),
  id: z.string().optional(),
});
export type GetUsersParams = z.infer<typeof getUsersParamsSchema>;

export const getUsersResponseSchema = z.object({
  hasNext: z.boolean(),
  users: z.array(userPreviewSchema),
});
export type GetUsersResponse = z.infer<typeof getUsersResponseSchema>;

// POST /users/login
export const postUserLoginResponseSchema = z.object({
  user: userSchema,
});
export type PostUserLoginResponse = z.infer<typeof postUserLoginResponseSchema>;

// GET /users/me
export const getUserMeResponseSchema = z.object({
  user: userSchema,
});
export type GetUserMeResponse = z.infer<typeof getUserMeResponseSchema>;

// PATCH /users/me
export const patchUserMeParamsSchema = userSchema.partial();
export type PatchUserMeParams = z.infer<typeof patchUserMeParamsSchema>;

export const patchUserMeResponseSchema = z.object({
  user: userSchema,
});
export type PatchUserMeResponse = z.infer<typeof patchUserMeResponseSchema>;

// POST /users/me
export const postUserMeRequestSchema = userPreviewSchema
  .omit({
    numFollowers: true,
  })
  .extend({
    provider: z.enum(["FACEBOOK", "GOOGLE", "GITHUB"]),
    providerId: z.string(),
    inviteCode: z.string(),
  });
export type PostUserMeResquest = z.infer<typeof postUserMeRequestSchema>;

export const postUserMeResponseSchema = z.object({
  user: userSchema,
});
export type PostUserMeResponse = z.infer<typeof postUserMeResponseSchema>;

// POST /users/validate/handle
export const postUserValidateHandleRequestSchema = z.object({
  handle: z.string(),
});
export type PostUserValidateHandleRequest = z.infer<
  typeof postUserValidateHandleRequestSchema
>;

// POST /users/validate/invite-code
export const postUserValidateInviteCodeRequestSchema = z.object({
  inviteCode: z.string(),
});
export type PostUserValidateInviteCodeRequest = z.infer<
  typeof postUserValidateInviteCodeRequestSchema
>;

// POST /users/follow
export const postUserFollowRequestSchema = z.object({
  userId: z.string(),
});
export type PostUserFollowRequest = z.infer<typeof postUserFollowRequestSchema>;

// DELETE /users/follow
export const deleteUserFollowParamsSchema = z.object({
  userId: z.string(),
});
export type DeleteUserFollowParams = z.infer<
  typeof deleteUserFollowParamsSchema
>;

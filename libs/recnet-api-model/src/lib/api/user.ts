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

// GET /users/login
export const getUserLoginResponseSchema = z.object({
  user: userSchema,
});
export type GetUserLoginResponse = z.infer<typeof getUserLoginResponseSchema>;

// GET /users/me
export const getUserMeResponseSchema = z.object({
  user: userSchema,
});
export type GetUserMeResponse = z.infer<typeof getUserMeResponseSchema>;

// PATCH /users/me
export const patchUserMeRequestSchema = userSchema
  .omit({
    id: true,
    numFollowers: true,
    numRecs: true,
    following: true,
    role: true,
  })
  .partial();
export type PatchUserMeRequest = z.infer<typeof patchUserMeRequestSchema>;

export const patchUserMeResponseSchema = z.object({
  user: userSchema,
});
export type PatchUserMeResponse = z.infer<typeof patchUserMeResponseSchema>;

// PATCH /users/me/activate
export const patchUserMeActivateRequestSchema = z.object({
  isActivated: z.boolean(),
});
export type PatchUserMeActivateRequest = z.infer<
  typeof patchUserMeActivateRequestSchema
>;

export const patchUserMeActivateResponseSchema = z.object({
  user: userSchema,
});

// POST /users/me
export const postUserMeRequestSchema = userPreviewSchema
  .omit({
    id: true,
    numFollowers: true,
    numRecs: true,
  })
  .extend({
    email: z.string(),
    googleScholarLink: z.string().url().nullable(),
    semanticScholarLink: z.string().url().nullable(),
    openReviewUserName: z.string().nullable(),
    inviteCode: z.string(),
  });
export type PostUserMeRequest = z.infer<typeof postUserMeRequestSchema>;

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

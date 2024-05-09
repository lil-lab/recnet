import { z } from "zod";

import { inviteCodeSchema } from "../model";

// GET /invite-codes/all
export const getInviteCodesAllParamsSchema = z.object({
  page: z.coerce.number(),
  pageSize: z.coerce.number(),
  // ref: https://github.com/colinhacks/zod/issues/1630#issuecomment-1710498376
  // since z.coerce.boolean will parse "false" as true, need this workaround for api to properly parse "false" as false
  used: z
    .union([z.boolean(), z.literal("true"), z.literal("false")])
    .transform((value) => value === true || value === "true")
    .optional(),
});
export type GetInviteCodesAllParams = z.infer<
  typeof getInviteCodesAllParamsSchema
>;

export const getInviteCodesAllResponseSchema = z.object({
  hasNext: z.boolean(),
  inviteCodes: z.array(inviteCodeSchema),
});
export type GetInviteCodesAllResponse = z.infer<
  typeof getInviteCodesAllResponseSchema
>;

// GET /invite-codes
export const getInviteCodesParamsSchema = z.object({
  page: z.coerce.number(),
  pageSize: z.coerce.number(),
  used: z
    .union([z.boolean(), z.literal("true"), z.literal("false")])
    .transform((value) => value === true || value === "true")
    .optional(),
});
export type GetInviteCodesParams = z.infer<typeof getInviteCodesParamsSchema>;

export const getInviteCodesResponseSchema = z.object({
  hasNext: z.boolean(),
  inviteCodes: z.array(inviteCodeSchema),
  unusedCodesCount: z.number(),
});
export type GetInviteCodesResponse = z.infer<
  typeof getInviteCodesResponseSchema
>;

// POST /invite-codes
export const postInviteCodesRequestSchema = z.object({
  numCodes: z.number().min(1).max(20),
  ownerId: z.string().nullable(),
  upperBound: z.number().nullable(),
});
export type PostInviteCodesRequest = z.infer<
  typeof postInviteCodesRequestSchema
>;

export const postInviteCodesResponseSchema = z.object({
  codes: z.array(z.string()),
});
export type PostInviteCodesResponse = z.infer<
  typeof postInviteCodesResponseSchema
>;

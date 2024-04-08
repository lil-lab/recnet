import { z } from "zod";

import { inviteCodeSchema } from "../model";

// GET /stats
export const getStatsResponseSchema = z.object({
  numUsers: z.number(),
  numRecs: z.number(),
  numRecsOverTime: z.record(z.string(), z.number()),
  numUpcomingRecs: z.number(),
});
export type GetStatsResponse = z.infer<typeof getStatsResponseSchema>;

// GET /inviteCodes
export const getInviteCodesParamsSchema = z.object({
  page: z.coerce.number(),
  pageSize: z.coerce.number(),
  // ref: https://github.com/colinhacks/zod/issues/1630#issuecomment-1710498376
  // since z.coerce.boolean will parse "false" as true, need this workaround for api to properly parse "false" as false
  used: z
    .union([z.boolean(), z.literal("true"), z.literal("false")])
    .transform((value) => value === true || value === "true")
    .optional(),
});
export type GetInviteCodesParams = z.infer<typeof getInviteCodesParamsSchema>;

export const getInviteCodesResponseSchema = z.object({
  hasNext: z.boolean(),
  inviteCodes: z.array(inviteCodeSchema),
});
export type GetInviteCodesResponse = z.infer<
  typeof getInviteCodesResponseSchema
>;

// POST /inviteCodes
export const postInviteCodesRequestSchema = z.object({
  numCodes: z.number().min(1).max(20),
  ownerId: z.string(),
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

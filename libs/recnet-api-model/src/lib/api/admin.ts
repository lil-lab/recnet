import { z } from "zod";

import { inviteCodeSchema } from "../model";

// GET /stats
export const getStatsResponseSchema = z.object({
  numUsers: z.number(),
  numRecs: z.number(),
  numRecsOverTime: z.record(z.number(), z.number()),
  numUpcomingRecs: z.number(),
});
export type GetStatsResponse = z.infer<typeof getStatsResponseSchema>;

// GET /inviteCodes
export const getInviteCodesParamsSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  used: z.boolean().optional(),
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
  numCodes: z.number(),
  ownerId: z.string(),
});
export type PostInviteCodesRequest = z.infer<
  typeof postInviteCodesRequestSchema
>;

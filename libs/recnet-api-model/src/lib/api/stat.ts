import { z } from "zod";

import { recSchema } from "../model";

// GET /stats
export const getStatsResponseSchema = z.object({
  numUsers: z.number(),
  numRecs: z.number(),
  numRecsOverTime: z.record(z.string(), z.number()),
  numUpcomingRecs: z.number(),
});
export type GetStatsResponse = z.infer<typeof getStatsResponseSchema>;

// GET /stats/recs
export const getStatsRecsParamsSchema = z.object({
  cutoff: z.union([
    z.string().transform((val) => parseInt(val, 10)),
    z.number(),
  ]),
});
export type GetStatsRecsParams = z.infer<typeof getStatsRecsParamsSchema>;

export const getStatsRecsResponseSchema = z.object({
  recs: z.array(recSchema),
});
export type GetStatsRecsResponse = z.infer<typeof getStatsRecsResponseSchema>;

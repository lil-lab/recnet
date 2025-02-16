import { z } from "zod";

// Define the recommendation detail schema
export const recDetailSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  userHandle: z.string(),
  recId: z.string(),
  recTitle: z.string(),
  recLink: z.string(),
  timestamp: z.number(),
});

// GET /stats
export const getStatsResponseSchema = z.object({
  numUsers: z.number(),
  numRecs: z.number(),
  numRecsOverTime: z.record(z.string(), z.number()),
  numUpcomingRecs: z.number(),
});
export type GetStatsResponse = z.infer<typeof getStatsResponseSchema>;

// GET /stats/period/:timestamp
export const getStatsPeriodResponseSchema = z.object({
  recommendations: z.array(recDetailSchema),
  periodStart: z.number(),
  periodEnd: z.number(),
});
export type GetStatsPeriodResponse = z.infer<
  typeof getStatsPeriodResponseSchema
>;

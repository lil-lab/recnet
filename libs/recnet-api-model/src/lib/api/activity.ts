import { z } from "zod";

import { activitySchema } from "../model";

// GET /activities
export const getActivitiesParamsSchema = z.object({
  page: z.coerce.number(),
  pageSize: z.coerce.number(),
  userId: z.string(),
});

export type GetActivitiesParams = z.infer<typeof getActivitiesParamsSchema>;

export const getActivitiesResponseSchema = z.object({
  hasNext: z.boolean(),
  activities: z.array(activitySchema),
});
export type GetActivitiesResponse = z.infer<typeof getActivitiesResponseSchema>;

// GET /activities/feeds
export const getActivitiesFeedsParamsSchema = z.object({
  page: z.coerce.number(),
  pageSize: z.coerce.number(),
  cutoff: z.coerce.number().optional(), // timestamp
});
export type GetActivitiesFeedsParams = z.infer<
  typeof getActivitiesFeedsParamsSchema
>;

export const getActivitiesFeedsResponseSchema = z.object({
  hasNext: z.boolean(),
  activities: z.array(activitySchema),
});
export type GetActivitiesFeedsResponse = z.infer<
  typeof getActivitiesFeedsResponseSchema
>;

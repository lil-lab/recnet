import { z } from "zod";

// GET /activities
export const getActivitiesParamsSchema = z.object({
  page: z.coerce.number(),
  pageSize: z.coerce.number(),
  userId: z.string(),
});

export type GetActivitiesParams = z.infer<typeof getActivitiesParamsSchema>;

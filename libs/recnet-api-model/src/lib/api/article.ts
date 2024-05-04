import { z } from "zod";

import { articleSchema } from "../model";

// GET /articles
export const getArticlesParamsSchema = z.object({
  link: z.string().url(),
});
export type GetArticlesParams = z.infer<typeof getArticlesParamsSchema>;

export const getArticlesResponseSchema = z.object({
  article: articleSchema.nullable(),
});
export type GetArticlesResponse = z.infer<typeof getArticlesResponseSchema>;

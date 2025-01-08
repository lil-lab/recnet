import { z } from "zod";

import { articleSchema, reactionTypeSchema, recSchema } from "../model";

export const recFormSubmissionSchema = z.intersection(
  z.union([
    z.object({
      articleId: z.string(),
      article: z.null(),
    }),
    z.object({
      articleId: z.null(),
      article: articleSchema.omit({
        id: true,
        isVerified: true,
        abstract: true,
      }),
    }),
  ]),
  z.object({
    description: z.string(),
    isSelfRec: z.boolean(),
  })
);
export type RecFormSubmission = z.infer<typeof recFormSubmissionSchema>;

// GET /recs/rec/:id
export const getRecIdResponseSchema = z.object({
  rec: recSchema,
});
export type GetRecIdResponse = z.infer<typeof getRecIdResponseSchema>;

// GET /recs
export const getRecsParamsSchema = z.object({
  page: z.coerce.number(),
  pageSize: z.coerce.number(),
  userId: z.string(),
});
export type GetRecsParams = z.infer<typeof getRecsParamsSchema>;

export const getRecsResponseSchema = z.object({
  hasNext: z.boolean(),
  recs: z.array(recSchema),
});
export type GetRecsResponse = z.infer<typeof getRecsResponseSchema>;

// GET /recs/feeds
export const getRecsFeedsParamsSchema = z.object({
  page: z.coerce.number(),
  pageSize: z.coerce.number(),
  cutoff: z.coerce.number().optional(), // timestamp
});
export type GetRecsFeedsParams = z.infer<typeof getRecsFeedsParamsSchema>;

export const getRecsFeedsResponseSchema = z.object({
  hasNext: z.boolean(),
  recs: z.array(recSchema),
});
export type GetRecsFeedsResponse = z.infer<typeof getRecsFeedsResponseSchema>;

// GET /recs/upcoming
export const getRecsUpcomingResponseSchema = z.object({
  rec: recSchema.nullable(),
});
export type GetRecsUpcomingResponse = z.infer<
  typeof getRecsUpcomingResponseSchema
>;

// POST /recs/upcoming
export const postRecsUpcomingRequestSchema = recFormSubmissionSchema;
export type PostRecsUpcomingRequest = z.infer<
  typeof postRecsUpcomingRequestSchema
>;

export const postRecsUpcomingResponseSchema = z.object({
  rec: recSchema,
});
export type PostRecsUpcomingResponse = z.infer<
  typeof postRecsUpcomingResponseSchema
>;

// PATCH /recs/upcoming
export const patchRecsUpcomingRequestSchema = recFormSubmissionSchema;
export type PatchRecsUpcomingRequest = z.infer<
  typeof patchRecsUpcomingRequestSchema
>;

export const patchRecsUpcomingResponseSchema = z.object({
  rec: recSchema,
});
export type PatchRecsUpcomingResponse = z.infer<
  typeof patchRecsUpcomingResponseSchema
>;

// POST /recs/:id/reactions
export const postRecsReactionsRequestSchema = z.object({
  reaction: reactionTypeSchema,
});

export type PostRecsReactionsRequest = z.infer<
  typeof postRecsReactionsRequestSchema
>;

// DELETE /recs/:id/reactions
export const deleteRecReactionParamsSchema = z.object({
  reaction: reactionTypeSchema,
});
export type DeleteRecReactionParams = z.infer<
  typeof deleteRecReactionParamsSchema
>;

// GET /recs/popular
export const getRecsPopularResponseSchema = z.object({
  page: z.coerce.number(),
  pageSize: z.coerce.number(),
});
export type GetRecsPopularResponse = z.infer<
  typeof getRecsPopularResponseSchema
>;

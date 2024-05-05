import { z } from "zod";

import { announcementSchema } from "../model";

// GET /announcements
export const getAnnouncementsParamsSchema = z.object({
  page: z.coerce.number(),
  pageSize: z.coerce.number(),
  activatedOnly: z.coerce.boolean(),
  currentOnly: z.coerce.boolean(),
});
export type GetAnnouncementParams = z.infer<
  typeof getAnnouncementsParamsSchema
>;

export const getAnnouncementsResponseSchema = z.object({
  hasNext: z.boolean(),
  totalCount: z.number(),
  announcements: z.array(announcementSchema),
});
export type GetAnnouncementsResponse = z.infer<
  typeof getAnnouncementsResponseSchema
>;

// POST /announcements
export const postAnnouncementsRequestSchema = announcementSchema.omit({
  id: true,
  createBy: true,
});
export type PostAnnouncementRequest = z.infer<
  typeof postAnnouncementsRequestSchema
>;

export const postAnnouncementResponseSchema = announcementSchema;
export type PostAnnouncementResponse = z.infer<
  typeof postAnnouncementResponseSchema
>;

// PATCH /announcements/:id
export const patchAnnouncementRequestSchema = announcementSchema
  .omit({
    id: true,
    createBy: true,
  })
  .partial();
export type PatchAnnouncementRequest = z.infer<
  typeof patchAnnouncementRequestSchema
>;

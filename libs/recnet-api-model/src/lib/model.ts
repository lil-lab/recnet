import { z } from "zod";

export const dateSchema = z.string().datetime();

export const userRoleSchema = z.enum(["ADMIN", "USER"]);
export type UserRole = z.infer<typeof userRoleSchema>;

export const userPreviewSchema = z.object({
  id: z.string(),
  handle: z.string(),
  displayName: z.string(),
  photoUrl: z.string().url(),
  affiliation: z.string().nullable(),
  bio: z.string().nullable(),
  url: z.string().url().nullable(),
  numFollowers: z.number(),
  numRecs: z.number(),
});
export type UserPreview = z.infer<typeof userPreviewSchema>;

export const userSchema = userPreviewSchema.extend({
  email: z.string().email(),
  role: userRoleSchema,
  googleScholarLink: z.string().url().nullable(),
  semanticScholarLink: z.string().url().nullable(),
  openReviewUserName: z.string().nullable(),
  following: z.array(userPreviewSchema),
});
export type User = z.infer<typeof userSchema>;

export const articleSchema = z.object({
  id: z.string(),
  doi: z.string().nullable(),
  title: z.string(),
  author: z.string(),
  link: z.string().url(),
  year: z.number(),
  month: z.number().min(0).max(11).nullable(),
  isVerified: z.boolean(),
});
export type Article = z.infer<typeof articleSchema>;

export const recSchema = z.object({
  id: z.string(),
  description: z.string(),
  cutoff: dateSchema,
  user: userPreviewSchema,
  article: articleSchema,
});
export type Rec = z.infer<typeof recSchema>;

export const inviteCodeSchema = z.object({
  id: z.number(),
  code: z.string(), // add further regex validation?
  owner: userPreviewSchema,
  issuedAt: dateSchema,
  usedBy: userPreviewSchema.nullable(),
  usedAt: dateSchema.nullable(),
});
export type InviteCode = z.infer<typeof inviteCodeSchema>;

export const announcementSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  startAt: dateSchema,
  endAt: dateSchema,
  allowClose: z.boolean(),
  isActivated: z.boolean(),
  createdBy: userPreviewSchema,
});
export type Announcement = z.infer<typeof announcementSchema>;

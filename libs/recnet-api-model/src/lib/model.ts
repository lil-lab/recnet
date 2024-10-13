import { z } from "zod";

export const dateSchema = z.string().datetime();

export const userRoleSchema = z.enum(["ADMIN", "USER"]);
export type UserRole = z.infer<typeof userRoleSchema>;

export const reactionTypeSchema = z.enum([
  "THUMBS_UP",
  "THINKING",
  "SURPRISED",
  "CRYING",
  "STARRY_EYES",
  "MINDBLOWN",
  "EYES",
  "ROCKET",
  "HEART",
  "PRAY",
  "PARTY",
]);
export type ReactionType = z.infer<typeof reactionTypeSchema>;

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
  isActivated: z.boolean(),
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
  isSelfRec: z.boolean(),
  cutoff: dateSchema,
  user: userPreviewSchema,
  article: articleSchema,
  reactions: z.object({
    selfReactions: z.array(reactionTypeSchema),
    numReactions: z.array(
      z.object({
        type: reactionTypeSchema,
        count: z.number(),
      })
    ),
  }),
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

export const digitalLibrarySchema = z.object({
  id: z.number(),
  name: z.string(),
  regex: z.array(z.string()),
  rank: z.number().min(1).max(100),
  isVerified: z.boolean(),
});
export type DigitalLibrary = z.infer<typeof digitalLibrarySchema>;

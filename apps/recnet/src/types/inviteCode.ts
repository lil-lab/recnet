import { z } from "zod";
import { FirebaseTsSchema } from "./rec";
import { UserSchema } from "./user";

export const inviteCodeSchema = z.object({
  id: z.string(),
  used: z.boolean(),
  usedAt: FirebaseTsSchema.optional().nullable(),
  usedBy: UserSchema.optional().nullable(),
  issuedTo: UserSchema.optional().nullable(),
});

export type InviteCode = z.infer<typeof inviteCodeSchema>;

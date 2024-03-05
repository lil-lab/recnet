import { z } from "zod";
import { FirebaseTsSchema } from "./rec";
import { UserSchema } from "./user";

export const inviteCodeSchema = z.object({
  id: z.string(),
  used: z.boolean(),
  usedAt: FirebaseTsSchema.optional(),
  usedBy: UserSchema.optional(),
  issuedTo: UserSchema.optional(),
});

export type InviteCode = z.infer<typeof inviteCodeSchema>;

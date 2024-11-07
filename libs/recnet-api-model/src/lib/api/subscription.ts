import { z } from "zod";

import { subscriptionSchema } from "../model";

// GET /users/subscriptions
export const getUsersSubscriptionsResponseSchema = z.object({
  subscriptions: z.array(subscriptionSchema),
});
export type GetUsersSubscriptionsResponse = z.infer<
  typeof getUsersSubscriptionsResponseSchema
>;

// POST /users/subscriptions
export const postUsersSubscriptionsRequestSchema = z.object({
  subscription: subscriptionSchema,
});
export type PostUsersSubscriptionsRequest = z.infer<
  typeof postUsersSubscriptionsRequestSchema
>;

export const postUsersSubscriptionsResponseSchema = z.object({
  subscription: subscriptionSchema,
});
export type PostUsersSubscriptionsResponse = z.infer<
  typeof postUsersSubscriptionsResponseSchema
>;

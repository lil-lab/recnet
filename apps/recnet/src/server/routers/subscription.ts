import {
  getUsersSubscriptionsResponseSchema,
  postUsersSubscriptionsRequestSchema,
  postUsersSubscriptionsResponseSchema,
} from "@recnet/recnet-api-model";

import { checkRecnetJWTProcedure } from "./middleware";

import { router } from "../trpc";

export const subscriptionRouter = router({
  getSubscriptions: checkRecnetJWTProcedure
    .output(getUsersSubscriptionsResponseSchema)
    .query(async (opts) => {
      const { recnetApi } = opts.ctx;
      const { data } = await recnetApi.get("/users/subscriptions");
      return getUsersSubscriptionsResponseSchema.parse(data);
    }),
  updateSubscription: checkRecnetJWTProcedure
    .input(postUsersSubscriptionsRequestSchema)
    .output(postUsersSubscriptionsResponseSchema)
    .mutation(async (opts) => {
      // TODO: after finish the API, use API call below
      const subscription = opts.input;
      const { recnetApi } = opts.ctx;
      const { data } = await recnetApi.post("/users/subscriptions", {
        ...postUsersSubscriptionsRequestSchema.parse(subscription),
      });
      return postUsersSubscriptionsResponseSchema.parse(data);
    }),
});

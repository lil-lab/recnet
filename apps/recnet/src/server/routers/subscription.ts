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
      // TODO: after finish the API, use API call below
      // const { recnetApi } = opts.ctx
      // const { data } = await recnetApi.get("/users/subscriptions")
      // return getUsersSubscriptionsResponseSchema.parse(data)

      // Use mock data since the API is not ready
      const mockData = getUsersSubscriptionsResponseSchema.parse({
        subscriptions: [
          {
            type: "WEEKLY_DIGEST",
            channels: ["EMAIL"],
          },
        ],
      });
      return mockData;
    }),
  updateSubscription: checkRecnetJWTProcedure
    .input(postUsersSubscriptionsRequestSchema)
    .output(postUsersSubscriptionsResponseSchema)
    .mutation(async (opts) => {
      // TODO: after finish the API, use API call below
      const { subscription } = opts.input;
      // const { recnetApi } = opts.ctx;
      // const { data } = await recnetApi.post("/users/subscriptions", {
      //   subscription: subscription,
      // });
      // return postUsersSubscriptionsResponseSchema.parse(data);

      // Use mock data(whatever user input) since the API is not ready
      return postUsersSubscriptionsResponseSchema.parse({
        subscription,
      });
    }),
});

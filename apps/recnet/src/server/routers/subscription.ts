import {
  getUsersSubscriptionsResponseSchema,
  postUsersSubscriptionsRequestSchema,
  postUsersSubscriptionsResponseSchema,
} from "@recnet/recnet-api-model";

import { checkRecnetJWTProcedure } from "./middleware";

import { router } from "../trpc";

let mockSubscriptionsData = {
  subscriptions: [
    {
      type: "WEEKLY_DIGEST",
      channels: ["EMAIL"],
    },
  ],
};

export const subscriptionRouter = router({
  getSubscriptions: checkRecnetJWTProcedure
    .output(getUsersSubscriptionsResponseSchema)
    .query(async (opts) => {
      // TODO: after finish the API, use API call below
      // const { recnetApi } = opts.ctx
      // const { data } = await recnetApi.get("/users/subscriptions")
      // return getUsersSubscriptionsResponseSchema.parse(data)

      // Use mock data since the API is not ready
      return getUsersSubscriptionsResponseSchema.parse(mockSubscriptionsData);
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
      // update mockSubscriptionsData
      mockSubscriptionsData = {
        subscriptions: mockSubscriptionsData.subscriptions.map((s) => {
          if (s.type === subscription.type) {
            return subscription;
          }
          return s;
        }),
      };
      return postUsersSubscriptionsResponseSchema.parse({
        subscription,
      });
    }),
});

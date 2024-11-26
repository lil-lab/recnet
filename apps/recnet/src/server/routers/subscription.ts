import {
  getUsersSubscriptionsResponseSchema,
  getUsersSubscriptionsSlackOauthResponseSchema,
  postUsersSubscriptionsRequestSchema,
  postUsersSubscriptionsResponseSchema,
  postUsersSubscriptionsSlackOauthRequestSchema,
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
      const subscription = opts.input;
      const { recnetApi } = opts.ctx;
      const { data } = await recnetApi.post("/users/subscriptions", {
        ...postUsersSubscriptionsRequestSchema.parse(subscription),
      });
      return postUsersSubscriptionsResponseSchema.parse(data);
    }),
  slackOAuth2FA: checkRecnetJWTProcedure
    .input(postUsersSubscriptionsSlackOauthRequestSchema)
    .mutation(async (opts) => {
      // const { code } = opts.input;
      // const { recnetApi } = opts.ctx;

      // TODO: uncomment this when the API is ready
      // const { data } = await recnetApi.post("/users/subscriptions/slack/oauth");
      // return data;

      console.log("Slack OAuth 2FA success");
      return;
    }),
  getSlackOAuthStatus: checkRecnetJWTProcedure
    .output(getUsersSubscriptionsSlackOauthResponseSchema)
    .query(async (opts) => {
      // const { recnetApi } = opts.ctx;
      // const { data } = await recnetApi.get("/users/subscriptions/slack/oauth");
      // return getUsersSubscriptionsSlackOAuthResponseSchema.parse(data);

      return getUsersSubscriptionsSlackOauthResponseSchema.parse({
        workspaceName: null,
      });
    }),
});

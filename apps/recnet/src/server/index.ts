import { announcementRouter } from "./routers/announcement";
import { articleRouter } from "./routers/article";
import { inviteCodeRouter } from "./routers/inviteCode";
import { publicRouter } from "./routers/public";
import { recRouter } from "./routers/rec";
import { subscriptionRouter } from "./routers/subscription";
import { userRouter } from "./routers/user";
import { mergeRouters } from "./trpc";

export const appRouter = mergeRouters(
  publicRouter,
  userRouter,
  recRouter,
  inviteCodeRouter,
  articleRouter,
  announcementRouter,
  subscriptionRouter
);

export type AppRouter = typeof appRouter;

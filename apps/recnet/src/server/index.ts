import { announcementRouter } from "./routers/announcement";
import { articleRouter } from "./routers/article";
import { inviteCodeRouter } from "./routers/inviteCode";
import { publicRouter } from "./routers/public";
import { recRouter } from "./routers/rec";
import { statsRouter } from "./routers/stats";
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
  subscriptionRouter,
  statsRouter
);

export type AppRouter = typeof appRouter;

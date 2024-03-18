import { mergeRouters } from "./trpc";
import { publicRouter } from "./routers/public";
import { userRouter } from "./routers/user";
import { recRouter } from "./routers/rec";
import { inviteCodeRouter } from "./routers/inviteCode";

export const appRouter = mergeRouters(
  publicRouter,
  userRouter,
  recRouter,
  inviteCodeRouter
);

export type AppRouter = typeof appRouter;

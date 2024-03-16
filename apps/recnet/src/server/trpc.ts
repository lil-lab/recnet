import { initTRPC } from "@trpc/server";
import { z } from "zod";

const contextSchema = z.object({});
type Context = z.infer<typeof contextSchema>;

const trpc = initTRPC.context<Context>().create();
export const { router, procedure, createCallerFactory } = trpc;

import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { ErrorMessages } from "@recnet/recnet-web/constant";

import {
  userPreviewSchema,
  postInviteCodesRequestSchema,
  postInviteCodesResponseSchema,
  getUsersParamsSchema,
  getInviteCodesAllResponseSchema,
  getInviteCodesAllParamsSchema,
  getInviteCodesResponseSchema,
  getInviteCodesParamsSchema,
} from "@recnet/recnet-api-model";

import { checkIsAdminProcedure, checkRecnetJWTProcedure } from "./middleware";

import { router } from "../trpc";

export const inviteCodeRouter = router({
  getAllInviteCodes: checkIsAdminProcedure
    .input(
      z.object({
        cursor: z.number(),
        pageSize: z.number(),
        used: z.boolean().optional(),
      })
    )
    .output(getInviteCodesAllResponseSchema)
    .query(async (opts) => {
      const { cursor: page, pageSize, used } = opts.input;
      const { recnetApi } = opts.ctx;
      const { data } = await recnetApi.get("/invite-codes/all", {
        params: {
          ...getInviteCodesAllParamsSchema.parse({
            page,
            pageSize,
            used,
          }),
        },
      });
      return getInviteCodesAllResponseSchema.parse(data);
    }),
  getInviteCodes: checkRecnetJWTProcedure
    .input(
      z.object({
        cursor: z.number(),
        pageSize: z.number(),
        used: z.boolean().optional(),
      })
    )
    .output(getInviteCodesResponseSchema)
    .query(async (opts) => {
      const { cursor: page, pageSize, used } = opts.input;
      const { recnetApi } = opts.ctx;
      const { data } = await recnetApi.get("/invite-codes", {
        params: {
          ...getInviteCodesParamsSchema.parse({
            page,
            pageSize,
            used,
          }),
        },
      });
      return getInviteCodesResponseSchema.parse(data);
    }),
  generateInviteCode: checkIsAdminProcedure
    .input(
      postInviteCodesRequestSchema
        .omit({ ownerId: true, upperBound: true })
        .extend({
          ownerHandle: z.string(),
        })
    )
    .output(postInviteCodesResponseSchema)
    .mutation(async (opts) => {
      const { ownerHandle, numCodes } = opts.input;
      const { recnetApi } = opts.ctx;
      // check if owner exists
      const { data: ownerData } = await recnetApi.get("/users", {
        params: {
          ...getUsersParamsSchema.parse({
            handle: ownerHandle,
            page: 1,
            pageSize: 1,
          }),
        },
      });
      const userParseRes = userPreviewSchema.safeParse(ownerData.users[0]);
      if (!userParseRes.success) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: ErrorMessages.USER_NOT_FOUND,
        });
      }
      const ownerId = userParseRes.data.id;
      const { data } = await recnetApi.post("invite-codes", {
        ...postInviteCodesRequestSchema.parse({
          ownerId,
          numCodes,
          upperBound: null,
        }),
      });
      return postInviteCodesResponseSchema.parse(data);
    }),
  provisionInviteCode: checkIsAdminProcedure
    .input(postInviteCodesRequestSchema.omit({ ownerId: true }))
    .output(postInviteCodesResponseSchema)
    .mutation(async (opts) => {
      const { recnetApi } = opts.ctx;
      const { data } = await recnetApi.post("invite-codes", {
        ...postInviteCodesRequestSchema.parse({
          ...opts.input,
          ownerId: null,
        }),
      });
      return postInviteCodesResponseSchema.parse(data);
    }),
});

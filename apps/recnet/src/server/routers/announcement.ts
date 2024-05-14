import { z } from "zod";

import {
  announcementSchema,
  getAnnouncementsResponseSchema,
  postAnnouncementResponseSchema,
  postAnnouncementsRequestSchema,
  getAnnouncementsParamsSchema,
  patchAnnouncementRequestSchema,
} from "@recnet/recnet-api-model";

import { checkIsAdminProcedure, publicApiProcedure } from "./middleware";

import { router } from "../trpc";

export const announcementRouter = router({
  getLatestAnnouncement: publicApiProcedure
    .output(announcementSchema.nullable())
    .query(async (opts) => {
      const { recnetApi } = opts.ctx;
      const { data } = await recnetApi.get(`/announcements`, {
        params: {
          ...getAnnouncementsParamsSchema.parse({
            page: 1,
            pageSize: 1,
            activatedOnly: true,
            currentOnly: true,
          }),
        },
      });
      const response = getAnnouncementsResponseSchema.parse(data);
      if (response.announcements.length === 0) {
        return null;
      }
      return response.announcements[0];
    }),
  createAnnouncement: checkIsAdminProcedure
    .input(postAnnouncementsRequestSchema)
    .output(postAnnouncementResponseSchema)
    .mutation(async (opts) => {
      const { recnetApi } = opts.ctx;
      const { data } = await recnetApi.post(`/announcements`, opts.input);
      return postAnnouncementResponseSchema.parse(data);
    }),
  updateAnnouncement: checkIsAdminProcedure
    .input(z.object({ id: z.number() }).merge(patchAnnouncementRequestSchema))
    .mutation(async (opts) => {
      const { recnetApi } = opts.ctx;
      const { id, ...data } = opts.input;
      await recnetApi.patch(`/announcements/${id}`, data);
    }),
});

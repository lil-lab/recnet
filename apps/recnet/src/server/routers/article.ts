import { z } from "zod";

import { db } from "@recnet/recnet-web/firebase/admin";

import { Month, monthToNum } from "@recnet/recnet-date-fns";

import { articleSchema } from "@recnet/recnet-api-model";

import { checkRecnetJWTProcedure } from "./middleware";

import { router } from "../trpc";

export const articleRouter = router({
  getArticleByLink: checkRecnetJWTProcedure
    .input(
      z.object({
        link: z.string(),
      })
    )
    .output(
      z.object({
        article: articleSchema.nullable(),
      })
    )
    .query(async (opts) => {
      const { link } = opts.input;
      // use link to get article info
      const querySnapshot = await db
        .collection("recommendations")
        .where("link", "==", link)
        .limit(1)
        .get();
      if (querySnapshot.empty) {
        return {
          article: null,
        };
      }
      return {
        article: {
          id: querySnapshot.docs[0].id,
          doi: null,
          title: querySnapshot.docs[0].data().title,
          author: querySnapshot.docs[0].data().author,
          link: querySnapshot.docs[0].data().link,
          year: parseInt(querySnapshot.docs[0].data().year),
          month:
            querySnapshot.docs[0].data().month === ""
              ? null
              : monthToNum[querySnapshot.docs[0].data().month as Month],
          isVerified: false,
        },
      };
    }),
});

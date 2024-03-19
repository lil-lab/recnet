import { publicProcedure, router } from "../trpc";
import { z } from "zod";
import { checkIsAdminProcedure, checkRecnetJWTProcedure } from "./middleware";
import { db } from "@recnet/recnet-web/firebase/admin";
import { TRPCError } from "@trpc/server";
import { Rec, recSchema, userPreviewSchema } from "@recnet/recnet-api-model";
import { getDateFromFirebaseTimestamp } from "@recnet/recnet-date-fns";
import { Month } from "@recnet/recnet-web/constant";
import { FieldValue } from "firebase-admin/firestore";
import { Timestamp } from "firebase-admin/firestore";
import { getNextCutOff } from "@recnet/recnet-date-fns";
import { notEmpty } from "@recnet/recnet-web/utils/notEmpty";
import { shuffleArray } from "@recnet/recnet-web/utils/shuffle";
import groupBy from "lodash.groupby";
import { FirebaseTsSchema } from "@recnet/recnet-web/types/rec";

export const recRouter = router({
  getUpcomingRec: checkRecnetJWTProcedure
    .output(
      z.object({
        rec: recSchema.nullable(),
      })
    )
    .query(async (opts) => {
      // REFACTOR_AFTER_MIGRATION
      const { tokens } = opts.ctx;
      const email = tokens.decodedToken.email as string;
      const querySnapshot = await db
        .collection("users")
        .where("email", "==", email)
        .limit(1)
        .get();
      if (querySnapshot.empty) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      const user = querySnapshot.docs[0].data();
      if (
        !user.postIds ||
        !Array.isArray(user.postIds) ||
        user.postIds.length === 0
      ) {
        return {
          rec: null,
        };
      }
      const latestRecId = user.postIds[user.postIds.length - 1];
      const recRef = db.doc(`recommendations/${latestRecId}`);
      const recSnap = await recRef.get();
      if (recSnap.exists) {
        const postData = recSnap.data();
        if (!postData) {
          return {
            rec: null,
          };
        }
        const userPreviewData = userPreviewSchema.parse({
          id: user.seed,
          handle: user.username,
          displayName: user.displayName,
          photoUrl: user.photoURL,
          affiliation: user?.affiliation ?? null,
          bio: user?.bio ?? null,
          numFollowers: user.followers.length,
        });
        const recData = recSchema.parse({
          id: latestRecId,
          description: postData.description,
          cutoff: getDateFromFirebaseTimestamp(postData.cutoff).toISOString(),
          user: userPreviewData,
          article: {
            id: latestRecId,
            doi: null,
            title: postData.title,
            author: postData.author,
            link: postData.link,
            year: parseInt(postData.year),
            month: !postData.month
              ? null
              : parseInt(Month[postData.month.toUpperCase()]),
            isVerified: false,
          },
        });
        return {
          rec: recData,
        };
      } else {
        return {
          rec: null,
        };
      }
    }),
  addUpcomingRec: checkRecnetJWTProcedure
    .input(
      z.object({
        // REFACTOR AFTER MIGRATION, year and month should be number
        link: z.string().url(),
        title: z.string().min(1),
        author: z.string().min(1),
        description: z.string().max(280).min(1),
        year: z.coerce.string(),
        month: z.coerce.string().optional(),
      })
    )
    .mutation(async (opts) => {
      const { user } = opts.ctx;
      const data = opts.input;
      // add rec to recommendations collection
      const { id } = await db.collection("recommendations").add({
        ...data,
        createdAt: FieldValue.serverTimestamp(),
        cutoff: Timestamp.fromMillis(getNextCutOff().getTime()),
        email: user.email,
        userId: user.id,
        month: data.month || "",
      });
      // update user's recs
      const userRef = db.doc(`users/${user.id}`);
      await userRef.set(
        {
          postIds: FieldValue.arrayUnion(id),
        },
        { merge: true }
      );
    }),
  editUpcomingRec: checkRecnetJWTProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          // REFACTOR AFTER MIGRATION, year and month should be number
          link: z.string().url(),
          title: z.string().min(1),
          author: z.string().min(1),
          description: z.string().max(280).min(1),
          year: z.coerce.string(),
          month: z.coerce.string().optional(),
        }),
      })
    )
    .mutation(async (opts) => {
      const { id, data } = opts.input;
      const postRef = db.doc(`recommendations/${id}`);
      await postRef.set(
        {
          ...data,
          month: data.month || "",
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }),
  deleteUpcomingRec: checkRecnetJWTProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async (opts) => {
      const { id } = opts.input;
      const { id: userId } = opts.ctx.user;
      const docRef = db.doc(`recommendations/${id}`);
      const docSnap = await docRef.get();
      if (docSnap.exists) {
        // delete from user postIds
        const userRef = db.doc(`users/${userId}`);
        await userRef.set(
          {
            postIds: FieldValue.arrayRemove(id),
          },
          { merge: true }
        );
        // delete post
        await docRef.delete();
      } else {
        // post doens't exist
        throw new Error("Post doesn't exist");
      }
    }),
  getHistoricalRecs: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .output(
      z.object({
        recs: z.array(recSchema),
      })
    )
    .query(async (opts) => {
      const { userId } = opts.input;
      const querySnapshot = await db
        .collection("recommendations")
        .where("userId", "==", userId)
        .where("cutoff", "!=", Timestamp.fromMillis(getNextCutOff().getTime()))
        .orderBy("cutoff", "desc")
        .get();
      const userRef = db.doc(`users/${userId}`);
      const userSnap = await userRef.get();
      const userData = userSnap.data();
      if (!userData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      const userPreviewData = userPreviewSchema.parse({
        id: userSnap.id,
        handle: userData.username,
        displayName: userData.displayName,
        photoUrl: userData.photoURL,
        affiliation: userData.affiliation || null,
        bio: userData.bio || null,
        numFollowers: userData.followers.length,
      });
      const recs = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const postData = doc.data();
          if (!postData) {
            return null;
          }
          const parseRes = recSchema.safeParse({
            id: doc.id,
            description: postData.description,
            cutoff: getDateFromFirebaseTimestamp(postData.cutoff).toISOString(),
            user: userPreviewData,
            article: {
              id: doc.id,
              doi: null,
              title: postData.title,
              author: postData.author,
              link: postData.link,
              year: parseInt(postData.year),
              month: !postData.month
                ? null
                : parseInt(Month[postData.month.toUpperCase()]),
              isVerified: false,
            },
          });
          if (parseRes.success) {
            return parseRes.data;
          }
          return null;
        })
      );
      return {
        recs: recs.filter(notEmpty),
      };
    }),
  getFeeds: checkRecnetJWTProcedure
    .input(
      z.object({
        cutoffTs: z.number(),
      })
    )
    .output(
      z.object({
        recs: z.array(recSchema),
      })
    )
    .query(async (opts) => {
      const { cutoffTs } = opts.input;
      const { id: userId } = opts.ctx.user;
      const docRef = db.doc(`users/${userId}`);
      const docSnap = await docRef.get();
      const data = docSnap.data();
      if (!data) {
        throw new Error("User not found");
      }
      const following = data.following;
      if (following.length === 0) {
        return {
          recs: [],
        };
      }

      // batch the recs every 30 items
      // since firestore has a limit for "IN" query, it supports up to 30 comparison values.
      // so we need to batch the following list
      // https://cloud.google.com/firestore/docs/query-data/queries
      const followingBatches: string[] = [];
      const batchSize = 30;
      for (let i = 0; i < following.length; i += batchSize) {
        followingBatches.push(following.slice(i, i + batchSize));
      }

      const recs: (Rec | null)[] = [];
      for (let i = 0; i < followingBatches.length; i++) {
        const batch = followingBatches[i];
        const querySnapshot = await db
          .collection("recommendations")
          .where("userId", "in", batch)
          .where("cutoff", "==", Timestamp.fromMillis(cutoffTs))
          .get();

        const batchRecs = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            // get userPreview for each rec
            const unparsedUser = await db
              .doc(`users/${doc.data().userId}`)
              .get();
            const userData = unparsedUser.data();
            if (!userData) {
              return null;
            }

            // parse rec
            const res = recSchema.safeParse({
              id: doc.id,
              description: doc.data().description,
              cutoff: getDateFromFirebaseTimestamp(
                doc.data().cutoff
              ).toISOString(),
              user: {
                id: unparsedUser.id,
                handle: userData.username,
                displayName: userData.displayName,
                photoUrl: userData.photoURL,
                affiliation: userData?.affiliation || null,
                bio: userData?.bio || null,
                numFollowers: userData?.followers?.length ?? 0,
              },
              article: {
                id: doc.id,
                doi: null,
                title: doc.data().title,
                author: doc.data().author,
                link: doc.data().link,
                year: parseInt(doc.data().year),
                month: !doc.data().month
                  ? null
                  : parseInt(Month[doc.data().month.toUpperCase()]),
                isVerified: false,
              },
            });
            if (res.success) {
              return res.data;
            } else {
              console.error("Failed to parse rec", res.error);
              return null;
            }
          })
        );
        recs.push(...batchRecs);
      }

      const seed = userId;
      return {
        recs: shuffleArray(recs.filter(notEmpty), seed),
      };
    }),
  getNumOfRecs: checkIsAdminProcedure
    .output(
      z.object({
        num: z.number(),
      })
    )
    .query(async (opts) => {
      const recs = await db.collection("recommendations").get();
      const recCount = recs.size;
      return {
        num: recCount,
      };
    }),
  getNumOfUpcomingRecs: checkIsAdminProcedure
    .output(
      z.object({
        num: z.number(),
      })
    )
    .query(async (opts) => {
      const cutOff = getNextCutOff();
      const recsThisCycle = await db
        .collection("recommendations")
        .where("cutoff", "==", Timestamp.fromMillis(cutOff.getTime()))
        .get();
      return {
        num: recsThisCycle.size,
      };
    }),
  getRecCountByCycle: checkIsAdminProcedure
    .output(
      z.object({
        recCountByCycle: z.record(z.number()),
      })
    )
    .query(async () => {
      const recs = await db.collection("recommendations").get();
      const schema = z.object({
        cutoff: FirebaseTsSchema,
        id: z.string(),
      });
      const filteredRecs = recs.docs
        .map((doc) => {
          const data = doc.data();
          // parse by rec schema
          const res = schema.safeParse({ ...data, id: doc.id });
          if (res.success) {
            return res.data;
          } else {
            // console.error("Failed to parse rec", res.error);
            return null;
          }
        })
        .filter(notEmpty);
      const recsGroupByCycle = groupBy(filteredRecs, (doc) => {
        const date = getDateFromFirebaseTimestamp(doc.cutoff);
        return date.getTime();
      });
      const recCountByCycle: Record<string, number> = Object.keys(
        recsGroupByCycle
      ).reduce(
        (acc, key) => ({
          ...acc,
          [key]: recsGroupByCycle[key].length,
        }),
        {}
      );
      return {
        recCountByCycle,
      };
    }),
});

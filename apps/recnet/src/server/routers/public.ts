import { publicProcedure, router } from "../trpc";
import { z } from "zod";
import { UserPreview, userPreviewSchema } from "@recnet/recnet-api-model";
import { db } from "@recnet/recnet-web/firebase/admin";
import { DocumentData } from "firebase-admin/firestore";
import { notEmpty } from "@recnet/recnet-web/utils/notEmpty";
import { Filter } from "firebase-admin/firestore";

const capitalize = (s: string) => {
  const words = s.split(" ");

  return words
    .map((word) => word[0].toUpperCase() + word.substring(1))
    .join(" ");
};

export const publicRouter = router({
  search: publicProcedure
    .input(
      z.object({
        keyword: z.string(),
      })
    )
    .output(
      z.object({
        users: z.array(userPreviewSchema),
      })
    )
    .query(async (opt) => {
      const { keyword } = opt.input;
      // REFACTOR_AFTER_MIGRATION: use Get Users By Filter GET /users to implement this
      const q = keyword.trim().replace(/ +(?= )/g, "");

      function checkUsers(users: DocumentData[]): UserPreview[] {
        const res = users
          .filter((user) => {
            return (
              user.username && // registered user (with username)
              !user.test // filter out test accounts
            );
          })
          .map((user) => {
            // validation for user schema
            const checkResult = userPreviewSchema.safeParse({
              id: user.id,
              handle: user.username,
              displayName: user.displayName,
              photoUrl: user.photoURL,
              affiliation: user.affiliation || null,
              bio: user.bio || null,
              numFollowers: user.followers.length,
            });
            if (!checkResult.success) {
              console.log(checkResult.error);
              return null;
            }
            return checkResult.data;
          })
          .filter(notEmpty);
        // remove duplicates
        const seen = new Set();
        return res.filter((user) => {
          const duplicate = seen.has(user.handle);
          seen.add(user.handle);
          return !duplicate;
        });
      }
      // edge case: empty query
      // return all users
      if (keyword.length === 0) {
        const allUsers = await db.collection("users").get();
        return {
          users: checkUsers(
            allUsers.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
          ),
        };
      }
      //search by username
      const usernameQuerySnapshot = await db
        .collection("users")
        .where("username", ">=", q)
        .where("username", "<=", q + "\uf8ff")
        .get();

      // search by dsiplayName
      const nameFilter = Filter.or(
        Filter.and(
          Filter.where("displayName", ">=", q),
          Filter.where("displayName", "<=", q + "\uf8ff")
        ),
        Filter.and(
          Filter.where("displayName", ">=", capitalize(q)),
          Filter.where("displayName", "<=", capitalize(q) + "\uf8ff")
        )
      );
      const nameQuerySnapshot = await db
        .collection("users")
        .where(nameFilter)
        .get();

      const results = [
        ...usernameQuerySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })),
        ...nameQuerySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })),
      ];

      return {
        users: checkUsers(results),
      };
    }),
});

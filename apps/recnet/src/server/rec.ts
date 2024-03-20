"use server";
import { getNextCutOff } from "@recnet/recnet-date-fns";
import { Timestamp } from "firebase-admin/firestore";
import { FieldValue } from "firebase-admin/firestore";

import { db } from "@recnet/recnet-web/firebase/admin";
import { getUsersByIds } from "@recnet/recnet-web/server/user";
import { RecSchema, Rec, RecWithUser } from "@recnet/recnet-web/types/rec";
import { User } from "@recnet/recnet-web/types/user";
import { notEmpty } from "@recnet/recnet-web/utils/notEmpty";
import { shuffleArray } from "@recnet/recnet-web/utils/shuffle";

export async function getRecsByUserId(
  userId: string,
  includeCurrentCutoff = false
): Promise<Rec[]> {
  let querySnapshot;
  if (includeCurrentCutoff === true) {
    // including upcoming post in current cutoff
    querySnapshot = await db
      .collection("recommendations")
      .where("userId", "==", userId)
      .orderBy("cutoff", "desc")
      .get();
  } else {
    querySnapshot = await db
      .collection("recommendations")
      .where("userId", "==", userId)
      .where("cutoff", "!=", Timestamp.fromMillis(getNextCutOff().getTime()))
      .orderBy("cutoff", "desc")
      .get();
  }

  const recs: Rec[] = [];
  querySnapshot.forEach((doc) => {
    const res = RecSchema.safeParse({ ...doc.data(), id: doc.id });
    if (res.success) {
      recs.push(res.data);
    } else {
      console.log(doc.data());
      console.error("Failed to parse rec", res.error);
    }
  });
  return recs;
}

export async function getFeedsRecs(
  userId: string,
  cutoffTs: number
): Promise<Rec[]> {
  const docRef = db.doc(`users/${userId}`);
  const docSnap = await docRef.get();
  const data = docSnap.data();
  if (!data) {
    throw new Error("User not found");
  }
  const following = data.following;
  if (following.length === 0) {
    return [];
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

  const recs: Rec[] = [];
  for (let i = 0; i < followingBatches.length; i++) {
    const batch = followingBatches[i];
    const querySnapshot = await db
      .collection("recommendations")
      .where("userId", "in", batch)
      .where("cutoff", "==", Timestamp.fromMillis(cutoffTs))
      .get();

    const batchRecs = querySnapshot.docs
      .map((doc) => {
        // parse rec
        const res = RecSchema.safeParse({ ...doc.data(), id: doc.id });
        if (res.success) {
          return res.data;
        } else {
          console.error("Failed to parse rec", res.error);
          return null;
        }
      })
      .filter(notEmpty);
    recs.push(...batchRecs);
  }

  const seed = userId;
  return shuffleArray(recs, seed);
}

export async function updateRec(
  recId: string,
  data: Partial<Rec>
): Promise<void> {
  const postRef = db.doc(`recommendations/${recId}`);
  await postRef.set(
    {
      ...data,
      month: data.month || "",
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

export async function insertRec(data: Partial<Rec>, user: User): Promise<void> {
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
}

export async function deleteRec(recId: string, userId: string): Promise<void> {
  const docRef = db.doc(`recommendations/${recId}`);
  const docSnap = await docRef.get();
  if (docSnap.exists) {
    // delete from user postIds
    const userRef = db.doc(`users/${userId}`);
    await userRef.set(
      {
        postIds: FieldValue.arrayRemove(recId),
      },
      { merge: true }
    );
    // delete post
    await docRef.delete();
  } else {
    // post doens't exist
    throw new Error("Post doesn't exist");
  }
}

export async function getRecsWithUsers(recs: Rec[]): Promise<RecWithUser[]> {
  const userIds = recs
    .map((rec) => rec.userId)
    .reduce<string[]>((arr, id) => {
      if (!arr.includes(id)) {
        return [...arr, id];
      }
      return arr;
    }, []);
  // get users
  const users = await getUsersByIds(userIds);
  const recsWithUsers = recs
    .map((rec) => {
      const user = users.find((u) => u.id === rec.userId);
      if (!user) {
        return null;
      }
      return { ...rec, user };
    })
    .filter(notEmpty);
  return recsWithUsers;
}

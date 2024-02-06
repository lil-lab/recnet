"use server";
import { db } from "@/firebase/admin";
import { RecSchema, Rec } from "@/types/rec";
import { Timestamp } from "firebase-admin/firestore";
import { getNextCutOff } from "@/utils/date";
import { notEmpty } from "@/utils/notEmpty";
import { FieldValue } from "firebase-admin/firestore";
import { User } from "@/types/user";

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

function shuffleArray<T>(_array: Array<T>): Array<T> {
  const array = [..._array];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
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

  const querySnapshot = await db
    .collection("recommendations")
    .where("userId", "in", following)
    .where("cutoff", "==", Timestamp.fromMillis(cutoffTs))
    .get();

  const recs = querySnapshot.docs
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

  return shuffleArray(recs);
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

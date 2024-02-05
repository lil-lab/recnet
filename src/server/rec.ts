"use server";
import { db } from "@/firebase/admin";
import { RecSchema, Rec } from "@/types/rec";
import { Timestamp } from "firebase-admin/firestore";
import { getNextCutOff } from "@/utils/date";
import { notEmpty } from "@/utils/notEmpty";

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

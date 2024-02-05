"use server";
import { db } from "@/firebase/admin";
import { RecSchema, Rec } from "@/types/rec";
import { Timestamp } from "firebase-admin/firestore";
import { getNextCutOff } from "@/utils/date";

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

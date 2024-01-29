"use server";
import { db } from "@/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function follow(userId: string, targetUserId: string) {
  if (!userId || !targetUserId) {
    throw new Error("userId and followId are required");
  }
  // add to [id] user followers
  await db.doc(`users/${targetUserId}`).update({
    followers: FieldValue.arrayUnion(userId),
  });

  // add to current user following
  await db.doc(`users/${userId}`).update({
    following: FieldValue.arrayUnion(targetUserId),
  });
}

export async function unfollow(userId: string, targetUserId: string) {
  if (!userId || !targetUserId) {
    throw new Error("userId and followId are required");
  }
  // remove from [id] user followers
  await db.doc(`users/${targetUserId}`).update({
    followers: FieldValue.arrayRemove(userId),
  });
  // remove from current user following
  await db.doc(`users/${userId}`).update({
    following: FieldValue.arrayRemove(targetUserId),
  });
}

export async function getUserByUsername(username: string) {
  const querySnapshot = await db
    .collection("users")
    .where("username", "==", username)
    .limit(1)
    .get();
  if (querySnapshot.empty) {
    null;
  }
  return querySnapshot.docs[0].data();
}

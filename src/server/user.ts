"use server";
import { db } from "@/firebase/admin";
import { User, UserSchema } from "@/types/user";
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

export async function getUsersByIds(ids: string[]): Promise<User[]> {
  const users = [];
  for (const userId of ids) {
    const docSnap = await db.doc(`users/${userId}`).get();
    if (docSnap.exists) {
      const res = UserSchema.safeParse(docSnap.data());
      if (res.success) {
        users.push({ ...res.data, id: docSnap.id });
      }
    }
  }
  return users;
}

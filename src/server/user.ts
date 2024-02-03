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

export async function updateUser(
  newUser: {
    username: string;
    name: string;
    affiliation?: string;
  },
  userId: string
) {
  const { username, name, affiliation } = newUser;
  const docRef = db.doc(`users/${userId}`);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    throw new Error("User does not exist.");
  }

  if (username != docSnap?.data?.()?.username) {
    if (username) {
      // check if username is unique
      const snapshot = await db
        .collection("users")
        .where("username", "==", username)
        .get();
      if (!snapshot.empty) {
        throw new Error("Username already exists.");
      }
    }
  }

  const data = {
    username: username,
    displayName: name,
    affiliation: affiliation,
  };
  await docRef.set(data, { merge: true });
  return username;
}

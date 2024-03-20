"use server";
import { db } from "@recnet/recnet-web/firebase/admin";
import { User, UserSchema } from "@recnet/recnet-web/types/user";
import { FieldValue } from "firebase-admin/firestore";
import { getFirebaseAuth } from "next-firebase-auth-edge";
import { authConfig } from "../serverEnv";
import { getTokenServerSide } from "../utils/getTokenServerSide";
import { UserRole } from "@recnet/recnet-api-model";

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
      const res = UserSchema.safeParse({ ...docSnap.data(), id: docSnap.id });
      if (res.success) {
        users.push({ ...res.data, id: docSnap.id });
      } else {
        console.error("Error parsing user", res.error);
      }
    }
  }
  return users;
}

export async function getUserById(userId: string): Promise<User | null> {
  const docSnap = await db.doc(`users/${userId}`).get();
  if (docSnap.exists) {
    const res = UserSchema.safeParse({ ...docSnap.data(), id: docSnap.id });
    if (res.success) {
      return UserSchema.parse({ ...docSnap.data(), id: docSnap.id });
    }
  }
  return null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const querySnapshot = await db
    .collection("users")
    .where("email", "==", email)
    .limit(1)
    .get();
  if (querySnapshot.empty) {
    return null;
  }
  // parse the user
  const user = {
    ...querySnapshot.docs[0].data(),
    id: querySnapshot.docs[0].id,
  };
  const parsedUser = UserSchema.parse(user);
  return parsedUser;
}

export async function getUserByUsername(
  username: string
): Promise<User | null> {
  const querySnapshot = await db
    .collection("users")
    .where("username", "==", username)
    .limit(1)
    .get();
  if (querySnapshot.empty) {
    return null;
  }
  return UserSchema.parse({
    ...querySnapshot.docs[0].data(),
    id: querySnapshot.docs[0].id,
  });
}

export async function checkUsernameUnique(username: string): Promise<boolean> {
  const querySnapshot = await db
    .collection("users")
    .where("username", "==", username)
    .limit(1)
    .get();
  return querySnapshot.empty;
}

export async function checkInviteCodeValid(code: string): Promise<boolean> {
  const ref = db.doc(`invite-codes/${code}`);
  const docSnap = await ref.get();
  if (docSnap.exists) {
    return docSnap.data()?.used === false;
  }
  return false;
}

export async function updateUser(
  newUser: {
    username: string;
    name: string;
    affiliation?: string;
  },
  userId: string
): Promise<string> {
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

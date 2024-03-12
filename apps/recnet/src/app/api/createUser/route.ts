import { type NextRequest } from "next/server";
import { db } from "@recnet/recnet-web/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  try {
    const res = await request.json();
    const { inviteCode, firebaseUser: user, username, affiliation } = res;
    const codeRef = db.doc(`invite-codes/${inviteCode}`);
    const codeDoc = await codeRef.get();
    if (!codeDoc.exists) {
      throw new Error("Invalid invite code");
    }
    if (codeDoc.data()?.used) {
      throw new Error("Invite code already used");
    }
    if (!user) {
      throw new Error("User not found");
    }
    // create user
    const userData = {
      ...user,
      createdAt: FieldValue.serverTimestamp(),
      followers: [],
      following: [],
      inviteCode: inviteCode,
      username: username,
      affiliation: affiliation,
    };
    const { id: userId } = await db.collection("users").add(userData);
    const userRef = db.doc(`users/${userId}`);
    const additionalInfo = { seed: userId, id: userId };
    await userRef.set(additionalInfo, { merge: true });
    // mark invite code as used
    await codeRef.set(
      { used: true, usedAt: FieldValue.serverTimestamp(), usedBy: userId },
      { merge: true }
    );
    return Response.json({
      message: "User created successfully!",
    });
  } catch (error) {
    return Response.json(null, { status: 500 });
  }
}

"use server";
import { db } from "@recnet/recnet-web/firebase/admin";
import Chance from "chance";
import { FieldValue } from "firebase-admin/firestore";

function getNewInviteCode() {
  const chance = new Chance();
  const code = chance.string({
    length: 16,
    pool: "abcdefghijklmnopqrstuvwxyz0123456789",
  });
  // split the code into 4 parts
  return (code.match(/.{1,4}/g) as string[]).join("-");
}

export async function generateInviteCode(ownerId: string, num: number) {
  const inviteCodes = Array.from({ length: num }, () => {
    return getNewInviteCode();
  });

  await Promise.all(
    inviteCodes.map(async (inviteCode) => {
      await db.collection("invite-codes").doc(inviteCode).set({
        id: inviteCode,
        issuedTo: ownerId,
        createdAt: FieldValue.serverTimestamp(),
        issuedAt: FieldValue.serverTimestamp(),
        used: false,
        usedAt: null,
        usedBy: null,
      });
    })
  );

  return inviteCodes;
}

const { db, getDateFromFirebaseTimestamp } = require("./setup");
const { PrismaClient } = require("@prisma/client");
const z = require("zod");

const inviteCodeSchema = z.object({
  code: z.string(),
  ownerId: z.string(),
  issuedAt: z.date(),
  usedById: z.string().nullable(),
  usedAt: z.date().nullable(),
});

const prisma = new PrismaClient();

async function main() {
  // get all invite codes from firestore
  console.log("Getting invite codes");
  const inviteCodes = await db.collection("invite-codes").get();
  console.log("Got invite codes");
  const inviteCodesData = inviteCodes.docs.map((doc) => {
    const data = doc.data();
    return inviteCodeSchema.parse({
      code: data.id,
      ownerId: data.issuedTo,
      issuedAt: getDateFromFirebaseTimestamp(data.createdAt),
      usedById: data.usedById ?? null,
      usedAt: data.usedAt ? getDateFromFirebaseTimestamp(data.usedAt) : null,
    });
  });
  console.log(inviteCodesData);
  // TODO: insert invite codes into prisma
}

main();

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
  // get all users from firestore
  const codes = await db.collection("invite-codes").get();
  let failedCodes = [];

  console.log("\n ============ Job start: 🔥 Pull codes ============ \n");
  const codesData = await Promise.all(
    codes.docs.map(async (doc) => {
      const data = doc.data();
      const owner = await db.collection("users").doc(data.issuedTo).get();
      const usedBy = data.usedBy
        ? await db.collection("users").doc(data.usedBy).get()
        : null;
      const codeRes = inviteCodeSchema.safeParse({
        code: data.id,
        ownerId: owner.data().providerData[0].uid,
        issuedAt: data.issuedAt
          ? getDateFromFirebaseTimestamp(data.issuedAt)
          : new Date(1698166450000), // defaul to start date of RecNet
        usedById: usedBy
          ? usedBy?.data()?.providerData?.[0]?.uid ?? null
          : null,
        usedAt:
          data.usedAt && usedBy && data.usedBy
            ? getDateFromFirebaseTimestamp(data.usedAt)
            : null,
      });
      if (!codeRes.success) {
        console.log(`Failed to parse code: ${codeRes.error}`);
        failedCodes.push(data);
      } else {
        return codeRes.data;
      }
    })
  );
  console.log(`🔥 Num of codes ${codesData.length} pulled from firestore`);
  console.log(`🔥 Failed to parse ${failedCodes.length} codes`);
  console.log(`🔥 Failed codes`, failedCodes);

  console.log(
    "\n ============ Job start: 🐘 Inserted invited codes ============ \n"
  );
  const failed = [];
  await Promise.all(
    codesData.map(async (data) => {
      if (!data) {
        return;
      }
      try {
        const owner = await prisma.user.findUnique({
          where: {
            providerId: data.ownerId,
          },
        });
        if (data.usedById) {
          const usedBy = await prisma.user.findUnique({
            where: {
              providerId: data.usedById,
            },
          });
          await prisma.inviteCode.create({
            data: {
              code: data.code,
              owner: {
                connect: {
                  id: owner.id,
                },
              },
              issuedAt: data.issuedAt,
              usedBy: {
                connect: {
                  id: usedBy.id,
                },
              },
              usedAt: data.usedAt,
            },
          });
        } else {
          await prisma.inviteCode.create({
            data: {
              code: data.code,
              owner: {
                connect: {
                  id: owner.id,
                },
              },
              issuedAt: data.issuedAt,
            },
          });
        }
      } catch (e) {
        console.log(`Failed to insert rec & article: ${e}`);
        console.log(data);
        failed.push(data);
      }
    })
  );
  console.log(`🐘 Inserted ${codesData.length - failed.length} codes`);
  console.log(`🐘Failed to insert ${failed.length} codes`);
  console.log(`🐘Failed users`, failed);
  console.log(`\n ============ Job end: 🎉 Inserted codes ============ \n`);
}

main();

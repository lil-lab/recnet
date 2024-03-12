const { db } = require("./setup");
const { PrismaClient } = require("@prisma/client");
const z = require("zod");

const followingRecordSchema = z.object({
  userId: z.string(),
  followerId: z.string(),
});

const prisma = new PrismaClient();

async function main() {
  const users = await db.collection("users").get();
  const followPairs = []; // array of [user, follower]

  console.log(
    "\n ============ Job start: 🔥 Pull user following relations ============ \n"
  );
  await Promise.all(
    users.docs.map(async (doc) => {
      const data = doc.data();
      await Promise.all(
        data.followers.map(async (followerId) => {
          const follower = await db.collection("users").doc(followerId).get();
          const res = followingRecordSchema.safeParse({
            userId: data.providerData[0].uid,
            followerId: follower.data().providerData[0].uid,
          });
          if (res.success) {
            followPairs.push([
              data.providerData[0].uid,
              follower.data().providerData[0].uid,
            ]);
          } else {
            console.log("Fail to parse following record");
          }
        })
      );
    })
  );
  console.log(`🔥 Finish processing following records`);

  console.log(
    "\n ============ Job start: 🐘 Inserted following records ============ \n"
  );
  const failed = [];
  await Promise.all(
    followPairs.map(async (data) => {
      const user = await prisma.user.findUnique({
        where: {
          providerId: data[0],
        },
      });
      const follower = await prisma.user.findUnique({
        where: {
          providerId: data[1],
        },
      });
      try {
        await prisma.followingRecord.create({
          data: {
            user: {
              connect: {
                id: user.id,
              },
            },
            follower: {
              connect: {
                id: follower.id,
              },
            },
          },
        });
      } catch (e) {
        console.log(`Failed to insert following record: ${e}`);
        console.log(data);
        failed.push(data);
      }
    })
  );
  console.log(
    `🐘 Inserted ${followPairs.length - failed.length} following records`
  );
  console.log(`🐘Failed to insert ${failed.length} users`);
  console.log(`🐘Failed pairs`, failed);
}

main();

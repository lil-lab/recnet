const { PrismaClient } = require("@prisma/client");
const z = require("zod");

const { db, getDateFromFirebaseTimestamp } = require("./setup");

const userSchema = z.object({
  provider: z.enum(["FACEBOOK", "GITHUB", "GOOGLE"]),
  providerId: z.string(),
  email: z.string().email(),
  handle: z.string(),
  displayName: z.string(),
  inviteCode: z.string().nullable(),
  photoUrl: z.string(),
  affiliation: z.string().nullable(),
  bio: z.string().nullable(),
  lastLoginAt: z.date(),
  role: z.enum(["USER", "ADMIN"]),
});

const prisma = new PrismaClient();

async function main() {
  // get all users from firestore
  const users = await db.collection("users").get();
  const failedUsers = [];

  console.log("\n ============ Job start: 🔥 Pull users ============ \n");
  const usersData = users.docs
    .map((doc) => {
      const data = doc.data();
      const res = userSchema.safeParse({
        provider: "GOOGLE", // now we only have google users
        providerId: data.providerData[0].uid,
        email: data.email,
        handle: data.username,
        displayName: data.displayName,
        inviteCode: data.inviteCode ?? null,
        photoUrl: data.photoURL,
        lastLoginAt: data.lastLoginAt
          ? new Date(parseInt(data.lastLoginAt))
          : new Date(), // default to now
        role:
          data?.role && (data.role === "ADMIN" || data.role === "admin")
            ? "ADMIN"
            : "USER",
        affiliation: data.affiliation ?? null,
        bio: null,
      });
      if (res.success) {
        return res.data;
      } else {
        console.log(`Failed to parse user: ${res.error}`);
        failedUsers.push(data);
      }
    })
    .filter((x) => x);
  console.log(`🔥 Num of users ${usersData.length} pulled from firestore`);
  console.log(`🔥 Failed to parse ${failedUsers.length} users`);
  console.log(`🔥 Failed users`, failedUsers);

  console.log("\n ============ Job start: 🐘 Inserted users ============ \n");
  const failed = [];
  await Promise.all(
    usersData.map(async (data) => {
      try {
        await prisma.user.create({
          data: {
            provider: data.provider,
            providerId: data.providerId,
            email: data.email,
            handle: data.handle,
            displayName: data.displayName,
            inviteCode: data.inviteCode,
            photoUrl: data.photoUrl,
            affiliation: data.affiliation,
            bio: data.bio,
            lastLoginAt: data.lastLoginAt,
            role: data.role,
          },
        });
      } catch (e) {
        console.log(`Failed to insert user: ${e}`);
        console.log(data);
        failed.push(data);
      }
    })
  );
  console.log(`🐘 Inserted ${usersData.length - failed.length} users`);
  console.log(`🐘Failed to insert ${failed.length} users`);
  console.log(`🐘Failed users`, failed);
}

main();

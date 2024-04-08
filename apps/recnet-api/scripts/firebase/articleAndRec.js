const { PrismaClient } = require("@prisma/client");
const z = require("zod");

const { db, getDateFromFirebaseTimestamp } = require("./setup");

// map how firebase stores month to how postgres stores month
const firebaseMonthToPostgreMonth = {
  "": null,
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

// manually map link to year for 9 unclear recs
const linkToYear = {
  "https://arxiv.org/abs/2307.02477": 2023,
  "https://psyarxiv.com/4u5g6": 2022,
  "https://aclanthology.org/2023.acl-long.844.pdf": 2023,
  "https://arxiv.org/abs/2305.18290": 2023,
  "https://arxiv.org/abs/2310.19089": 2023,
  "https://arxiv.org/pdf/2310.19785.pdf": 2023,
  "https://arxiv.org/abs/2305.07666": 2023,
  "https://aclanthology.org/2020.acl-main.442.pdf": 2020,
  "https://arxiv.org/abs/2306.08877": 2023,
};

const articleSchema = z.object({
  doi: z.string().nullable(),
  title: z.string(),
  author: z.string(),
  link: z.string().url(),
  year: z.coerce.number(),
  month: z
    .string()
    .transform((x) => firebaseMonthToPostgreMonth[x])
    .nullable(),
});

const recSchema = z.object({
  userId: z.string(),
  description: z.string(),
  cutoff: z.date(),
});

const prisma = new PrismaClient();

async function main() {
  // get all users from firestore
  const recs = await db.collection("recommendations").get();
  let failedRecs = [];
  let failedArticles = [];

  console.log("\n ============ Job start: 🔥 Pull recs ============ \n");
  const articleData = await Promise.all(
    recs.docs.map(async (doc) => {
      const data = doc.data();
      const articleRes = articleSchema.safeParse({
        doi: null,
        title: data.title,
        author: data.author,
        link: data.link,
        year: data.year ? data.year : linkToYear?.[data.link],
        month: data.month ?? null,
      });
      const firebaseUser = await db.collection("users").doc(data.userId).get();
      const firebaseUserData = firebaseUser.data();
      const recRes = recSchema.safeParse({
        userId: firebaseUserData.providerData[0].uid, // provider uid
        description: data.description,
        cutoff: getDateFromFirebaseTimestamp(data.cutoff),
      });
      if (!articleRes.success) {
        console.log(`Failed to parse user: ${articleRes.error}`);
        failedRecs.push(data);
      } else if (!recRes.success) {
        // console.log(data);
        console.log(`Failed to parse user: ${data}`);
        failedArticles.push(data);
      } else {
        return {
          article: articleRes.data,
          rec: recRes.data,
        };
      }
    })
  );
  console.log(`🔥 Num of recs ${articleData.length} pulled from firestore`);
  console.log(`🔥 Failed to parse ${failedRecs.length} recs`);
  console.log(`🔥 Failed to parse ${failedArticles.length} articles`);
  console.log(`🔥 Failed recs`, failedRecs);
  console.log(`🔥 Failed articles`, failedArticles);

  console.log(
    "\n ============ Job start: 🐘 Inserted recs & articles ============ \n"
  );
  const failed = [];
  await Promise.all(
    articleData.map(async (data) => {
      if (!data) {
        return;
      }
      try {
        const user = await prisma.user.findUnique({
          where: {
            providerId: data.rec.userId,
          },
        });
        await prisma.recommendation.create({
          data: {
            user: {
              connect: {
                id: user.id,
              },
            },
            article: {
              create: {
                ...data.article,
              },
            },
            description: data.rec.description,
            cutoff: data.rec.cutoff,
          },
        });
      } catch (e) {
        console.log(`Failed to insert rec & article: ${e}`);
        console.log(data);
        failed.push(data);
      }
    })
  );
  console.log(`🐘 Inserted ${articleData.length - failed.length} users`);
  console.log(`🐘Failed to insert ${failed.length} users`);
  console.log(`🐘Failed users`, failed);
  console.log(
    `\n ============ Job end: 🎉 Inserted recs & articles ============ \n`
  );
}

main();

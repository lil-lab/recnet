const admin = require("firebase-admin");
const z = require("zod");
const { Timestamp } = require("firebase/firestore");

const firebaseEnvSchema = z.object({
  FIREBASE_PROJECT_ID: z.string(),
  FIREBASE_CLIENT_EMAIL: z.string(),
  FIREBASE_PRIVATE_KEY: z.string().transform((s) => s.replace(/\\n/gm, "\n")),
});

const firebaseEnv = firebaseEnvSchema.parse(process.env);

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: firebaseEnv.FIREBASE_PROJECT_ID,
    clientEmail: firebaseEnv.FIREBASE_CLIENT_EMAIL,
    privateKey: firebaseEnv.FIREBASE_PRIVATE_KEY,
  }),
});

const db = admin.firestore();
const auth = admin.auth();

const getDateFromFirebaseTimestamp = (ts) => {
  const timestamp = new Timestamp(ts._seconds, ts._nanoseconds);
  return timestamp.toDate();
};

console.log("Firebase Admin Initialized");

module.exports = { db, auth, admin, getDateFromFirebaseTimestamp };

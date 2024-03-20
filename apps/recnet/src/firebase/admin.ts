import "server-only";
import * as admin from "firebase-admin";

import { serverEnv } from "@recnet/recnet-web/serverEnv";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: serverEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: serverEnv.FIREBASE_CLIENT_EMAIL,
      privateKey: serverEnv.FIREBASE_PRIVATE_KEY,
    }),
  });
}

const db = admin.firestore();
const auth = admin.auth();

export { db, auth };

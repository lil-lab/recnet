import { z } from "zod";

export const clientEnvSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string(),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string(),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string(),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string(),
  NEXT_PUBLIC_GA_TRACKING_ID: z.string(),
});

const clientEnvRes = clientEnvSchema.safeParse({
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  NEXT_PUBLIC_GA_TRACKING_ID: process.env.NEXT_PUBLIC_GA_TRACKING_ID,
});

if (!clientEnvRes.success) {
  // console.error(clientEnvRes.error.issues);
  throw new Error("There is an error with the CLIENT environment variables");
}

export const clientEnv = clientEnvRes.data;

export const firebaseClientEnv = {
  apiKey: clientEnvRes.data.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: clientEnvRes.data.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: clientEnvRes.data.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: clientEnvRes.data.NEXT_PUBLIC_FIREBASE_APP_ID,
};

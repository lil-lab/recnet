import { z } from "zod";

function resolveBaseUrl(env: string | undefined) {
  /**
   * If the environment is preview, we need to use the Vercel branch URL.
   * Otherwise, we use the base URL.
   * Ref: https://vercel.com/docs/projects/environment-variables/framework-environment-variables#NEXT_PUBLIC_VERCEL_BRANCH_URL
   */
  if (env === "preview") {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL}`;
  }
  return process.env.NEXT_PUBLIC_BASE_URL;
}

export const clientEnvSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string(),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string(),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string(),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string(),
  NEXT_PUBLIC_GA_TRACKING_ID: z.string(),
  NEXT_PUBLIC_ENV: z
    .enum(["development", "production", "preview"])
    .default("development"),
  NEXT_PUBLIC_BASE_URL: z.string(),
  NEXT_PUBLIC_APP_VERSION: z.string(),
  NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF: z.string().optional(),
});

const clientEnvRes = clientEnvSchema.safeParse({
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  NEXT_PUBLIC_GA_TRACKING_ID: process.env.NEXT_PUBLIC_GA_TRACKING_ID,
  NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV, // comsume from nextjs preset env vars: https://vercel.com/docs/projects/environment-variables/system-environment-variables#framework-environment-variables
  NEXT_PUBLIC_BASE_URL: resolveBaseUrl(process.env.NEXT_PUBLIC_VERCEL_ENV),
  NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
  NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF:
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF, // comsume from nextjs preset env vars: https://vercel.com/docs/projects/environment-variables/system-environment-variables#framework-environment-variables
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

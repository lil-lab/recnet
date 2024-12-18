import { z } from "zod";

import { resolveBaseUrl } from "./utils/resolveBaseUrl";

function resolveSlackRedirectUri(env: string | undefined) {
  const baseUrl = resolveBaseUrl(env);
  if (!baseUrl) {
    return undefined;
  }
  return baseUrl + process.env.SLACK_OAUTH_REDIRECT_URI;
}

const serverConfigSchema = z.object({
  USE_SECURE_COOKIES: z.coerce.boolean(),
  COOKIE_SIGNATURE_KEY: z.string(),
  FIREBASE_PRIVATE_KEY: z.string().transform((s) => s.replace(/\\n/gm, "\n")),
  FIREBASE_CLIENT_EMAIL: z.string(),
  CRON_SECRET: z.string(),
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string(),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string(),
  RECNET_API_ENDPOINT: z.string(),
  SLACK_APP_CLIENT_ID: z.string(),
  SLACK_OAUTH_APP_SCOPES: z.string(),
  SLACK_OAUTH_REDIRECT_URI: z.string(),
});

const serverConfigRes = serverConfigSchema.safeParse({
  USE_SECURE_COOKIES: process.env.USE_SECURE_COOKIES,
  COOKIE_SIGNATURE_KEY: process.env.COOKIE_SIGNATURE_KEY,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
  CRON_SECRET: process.env.CRON_SECRET,
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  RECNET_API_ENDPOINT: process.env.RECNET_API_ENDPOINT,
  SLACK_APP_CLIENT_ID: process.env.SLACK_APP_CLIENT_ID,
  SLACK_OAUTH_APP_SCOPES: process.env.SLACK_OAUTH_APP_SCOPES,
  SLACK_OAUTH_REDIRECT_URI: resolveSlackRedirectUri(
    process.env.NEXT_PUBLIC_VERCEL_ENV
  ),
});

if (!serverConfigRes.success) {
  console.error(serverConfigRes.error.issues);
  throw new Error("There is an error with the SERVER environment variables");
  process.exit(1);
}

export const serverEnv = serverConfigRes.data;

const serverConfig = {
  useSecureCookies: serverConfigRes.data.USE_SECURE_COOKIES,
  firebaseApiKey: serverConfigRes.data.NEXT_PUBLIC_FIREBASE_API_KEY,
  serviceAccount: {
    projectId: serverConfigRes.data.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: serverConfigRes.data.FIREBASE_CLIENT_EMAIL,
    privateKey: serverConfigRes.data.FIREBASE_PRIVATE_KEY,
  },
  cookieSignatureKey: serverConfigRes.data.COOKIE_SIGNATURE_KEY,
};

export const authConfig = {
  apiKey: serverConfig.firebaseApiKey,
  cookieName: "AuthToken",
  cookieSignatureKeys: [serverConfig.cookieSignatureKey],
  cookieSerializeOptions: {
    path: "/",
    httpOnly: true,
    secure: serverConfig.useSecureCookies, // Set this to true on HTTPS environments
    sameSite: "lax" as const,
    maxAge: 12 * 60 * 60 * 24, // twelve days
  },
  serviceAccount: serverConfig.serviceAccount,
};

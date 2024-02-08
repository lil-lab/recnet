import { Tokens, getTokens } from "next-firebase-auth-edge";
import { cookies } from "next/headers";
import { authConfig } from "@/config";
import { User, UserSchema } from "@/types/user";
import { db } from "@/firebase/admin";
import { getUserByEmail } from "@/server/user";

const toUser = async (tokens: Tokens | null): Promise<User | null> => {
  if (!tokens) {
    return null;
  }
  const { decodedToken } = tokens;
  const { email } = decodedToken;
  if (!email) {
    return null;
  }
  try {
    const user = await getUserByEmail(email);
    return user;
  } catch (e) {
    console.log("Error fetching user", e);
    return null;
  }
};

async function getUserServerSide(): Promise<User | null> {
  const tokens = await getTokens(cookies(), {
    apiKey: authConfig.apiKey,
    cookieName: authConfig.cookieName,
    cookieSignatureKeys: authConfig.cookieSignatureKeys,
    serviceAccount: authConfig.serviceAccount,
  });
  const user = await toUser(tokens);
  return user;
}

export { getUserServerSide };

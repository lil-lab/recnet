import "server-only";
import { Tokens, getTokens } from "next-firebase-auth-edge";
import { cookies } from "next/headers";
import { authConfig } from "@recnet/recnet-web/serverEnv";
import { User } from "@recnet/recnet-web/types/user";
import { getUserByEmail } from "@recnet/recnet-web/server/user";

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

interface GetUserServerSideOptions {
  isLoggedInCallback?: (user?: User) => void;
  notLoggedInCallback?: () => void;
  notRegisteredCallback?: (tokens?: Tokens) => void;
}

async function getUserServerSide(
  options?: GetUserServerSideOptions
): Promise<User | null> {
  const isLoggedInCallback = options?.isLoggedInCallback || (() => {});
  const notLoggedInCallback = options?.notLoggedInCallback || (() => {});
  const notRegisteredCallback = options?.notRegisteredCallback || (() => {});
  const tokens = await getTokens(cookies(), {
    apiKey: authConfig.apiKey,
    cookieName: authConfig.cookieName,
    cookieSignatureKeys: authConfig.cookieSignatureKeys,
    serviceAccount: authConfig.serviceAccount,
  });
  const user = await toUser(tokens);
  if (tokens && user) {
    isLoggedInCallback(user);
  } else if (tokens && !user) {
    notRegisteredCallback(tokens);
  } else {
    notLoggedInCallback();
  }
  return user;
}

export { getUserServerSide };

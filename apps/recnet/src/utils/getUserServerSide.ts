import "server-only";
import { Tokens } from "next-firebase-auth-edge";

import { serverClient } from "@recnet/recnet-web/app/_trpc/serverClient";
import { getTokenServerSide } from "@recnet/recnet-web/utils/getTokenServerSide";

import { User } from "@recnet/recnet-api-model";

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
  const tokens = await getTokenServerSide();
  let user: User | null = null;
  try {
    const res = await serverClient.getMe();
    user = res.user;
  } catch (e) {
    user = null;
  }
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

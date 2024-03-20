import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

import { firebaseClientEnv } from "@recnet/recnet-web/clientEnv";

export const getFirebaseApp = () => {
  if (getApps().length) {
    return getApp();
  }

  const app = initializeApp(firebaseClientEnv);

  return app;
};

export function getFirebaseAuth() {
  const auth = getAuth(getFirebaseApp());

  return auth;
}

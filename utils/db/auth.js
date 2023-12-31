import { auth, provider } from "./firebase-client";
import { signInWithPopup, onAuthStateChanged } from "firebase/auth";

export const logIn = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    return user.toJSON();
  } catch (error) {
    console.log(error);
  }
};

export const logOut = async () => {
  try {
    await auth.signOut();
  } catch (error) {
    console.log(error);
  }
};

export function getCurrentUser() {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        resolve(user);
      },
      reject
    );
  });
}

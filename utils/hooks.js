import { useRouter } from "next/router";
import { useEffect } from "react";
import { useSelector } from "react-redux";

/** Check user status and redirect when necessary. */
export function useCheckUser() {
  const user = useSelector((state) => state.user.value);
  const userLoaded = useSelector((state) => state.user.loaded);
  const router = useRouter();
  useEffect(() => {
    if (userLoaded) {
      if (user) {
        if (!user.username) {
          // check if user is registered with recnet (i.e. has username)
          // if not, redirect to welcome screen
          // logged in but no username
          router.replace("/welcome");
        }
      }
    }
  }, [userLoaded, user]);
}

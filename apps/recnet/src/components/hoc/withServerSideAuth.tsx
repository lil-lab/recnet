import "server-only";
import { notFound, redirect } from "next/navigation";

import { getUserServerSide } from "@recnet/recnet-web/utils/getUserServerSide";

import type { User, UserRole } from "@recnet/recnet-api-model";

interface ProhibitedRoleConfig {
  callback?: () => void;
  redirectRoute: string;
}

export interface WithServerSideAuthOptions {
  prohibitedRoles?:
    | UserRole[]
    | Partial<Record<UserRole, ProhibitedRoleConfig>>;
}

/**
    HOC to wrap a page or layout server component with server-side authentication.

    Handle the case where the user is not logged in by redirecting to the home page.
    If the user hasn't completed the onboarding process, redirect to the onboarding page.
    And if the user is logged in, render the wrapped component.

    @param options.prohibitedRoles - An array of roles that are not allowed to access the page. Alternatively, an object with roles and callbacks to handle the case where the user's role is not allowed to access the page. For example
    @example
    ```ts
    {
      prohibitedRoles: {
        [UserRole.User]: {
          callback: () => {
            console.log("Users are not allowed to access this page");
          },
          redirectRoute: "/",
        },
      },
    }
    ```
*/
export async function withServerSideAuth<T extends object>(
  Component: React.ComponentType<T & UserProps>,
  options?: WithServerSideAuthOptions
) {
  /**
    Handle unregistered or unauthenticated users.
  */
  const user = await getUserServerSide({
    notRegisteredCallback: () => {
      redirect("/onboard");
    },
  });
  if (!user) {
    // if not logged in, redirect to home
    redirect("/");
  }

  /**
    Handle prohibited roles.
  */
  if (options?.prohibitedRoles) {
    const prohibitedRoles = options.prohibitedRoles;
    if (Array.isArray(prohibitedRoles)) {
      // if the provided type is an array of roles
      if (prohibitedRoles.includes(user.role)) {
        notFound();
      }
    } else {
      // if the provided type is an object with roles and callbacks
      const roleConfig = prohibitedRoles?.[user.role];
      if (roleConfig) {
        roleConfig.callback?.();
        redirect(roleConfig.redirectRoute);
      }
    }
  }

  const WrappedComponent = async (props: T) => {
    return <Component {...props} user={user} />;
  };
  return WrappedComponent;
}

interface UserProps {
  user: User;
}

export type WithServerSideAuthProps<T = undefined> = T extends undefined
  ? UserProps
  : T & UserProps;

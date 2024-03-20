import { createContext, useContext } from "react";

import { User } from "@recnet/recnet-api-model";

export interface AuthContextValue {
  user: User | null;
  revalidateUser: () => void;
  isPending: boolean;
  isFetching: boolean;
  isError: boolean;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  revalidateUser: async () => {},
  isPending: false,
  isFetching: false,
  isError: false,
});

export const useAuth = () => useContext(AuthContext);

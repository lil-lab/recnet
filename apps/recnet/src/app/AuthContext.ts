import { createContext, useContext } from "react";
import { User } from "@recnet/recnet-web/types/user";

export interface AuthContextValue {
  user: User | null;
  revalidateUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  revalidateUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

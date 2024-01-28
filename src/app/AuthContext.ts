import { createContext, useContext } from "react";
import { User } from "@/types/user";

export interface AuthContextValue {
  user: User | null;
  revalidateUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  revalidateUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

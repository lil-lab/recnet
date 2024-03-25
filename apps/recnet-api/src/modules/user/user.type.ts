import { UserRole } from "@recnet/recnet-api-model";

export type UserFilterBy = {
  handle?: string;
  keyword?: string;
  id?: string;
};

export type AuthUser = {
  role: UserRole;
  userId: string;
};

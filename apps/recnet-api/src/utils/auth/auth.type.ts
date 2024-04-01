import {
  AuthProvider,
  RecNetJwtPayload,
  verifyFirebaseJwt,
  verifyRecnetJwt,
} from "@recnet/recnet-jwt";

export type VerifyJwtFunction =
  | typeof verifyFirebaseJwt
  | typeof verifyRecnetJwt;

export type RecNetJwtPayloadProps = keyof RecNetJwtPayload["recnet"];

export type AuthUser<
  Prop extends RecNetJwtPayloadProps | undefined = undefined,
> = Prop extends RecNetJwtPayloadProps
  ? RecNetJwtPayload["recnet"][Prop]
  : RecNetJwtPayload["recnet"];

export type AuthFirebaseUser = {
  provider: AuthProvider;
  providerId: string;
};

import {
  createParamDecorator,
  ExecutionContext,
  HttpStatus,
} from "@nestjs/common";

import { RecnetError } from "@recnet-api/utils/error/recnet.error";
import { ErrorCode } from "@recnet-api/utils/error/recnet.error.const";

import {
  AuthProvider,
  firebaseJwtPayloadSchema,
  googleProviderIdentitySchema,
  recnetJwtPayloadSchema,
} from "@recnet/recnet-jwt";

import { AuthFirebaseUser, RecNetJwtPayloadProps } from "./auth.type";

export const User = createParamDecorator<
  RecNetJwtPayloadProps | undefined,
  ExecutionContext
>((prop, ctx) => {
  const request = ctx.switchToHttp().getRequest();
  const recnetJwtPayload = recnetJwtPayloadSchema.safeParse(request.user);
  if (!recnetJwtPayload.success) {
    throw new RecnetError(
      ErrorCode.ZOD_VALIDATION_ERROR,
      HttpStatus.UNAUTHORIZED,
      "Invalid JWT payload"
    );
  }
  const recnetUser = recnetJwtPayload.data.recnet;

  return prop ? recnetUser[prop] : recnetUser;
});

export const UserOptional = createParamDecorator<
  RecNetJwtPayloadProps | undefined,
  ExecutionContext
>((prop, ctx) => {
  const request = ctx.switchToHttp().getRequest();
  const recnetJwtPayload = recnetJwtPayloadSchema.safeParse(request.user);
  if (!recnetJwtPayload.success) {
    return null;
  }
  const recnetUser = recnetJwtPayload.data.recnet;

  return prop ? recnetUser[prop] : recnetUser;
});

export const FirebaseUser = createParamDecorator<undefined, ExecutionContext>(
  (_, ctx): AuthFirebaseUser => {
    const request = ctx.switchToHttp().getRequest();
    const firebaseJwtPayload = firebaseJwtPayloadSchema.safeParse(request.user);
    if (!firebaseJwtPayload.success) {
      throw new RecnetError(
        ErrorCode.ZOD_VALIDATION_ERROR,
        HttpStatus.UNAUTHORIZED,
        "Invalid JWT payload"
      );
    }
    const rawFirebaseUser = firebaseJwtPayload.data;

    // transform the rawFirebaseUser to a FirebaseUser object
    const provider = rawFirebaseUser.source_sign_in_provider;
    let providerId: string | null = null;

    if (!provider || !Object.values(AuthProvider).includes(provider)) {
      throw new RecnetError(
        ErrorCode.ZOD_VALIDATION_ERROR,
        HttpStatus.UNAUTHORIZED,
        "Invalid JWT provider"
      );
    }

    if (provider === AuthProvider.Google) {
      const identities = googleProviderIdentitySchema.safeParse(
        rawFirebaseUser.firebase.identities
      );
      if (
        !identities.success ||
        !identities.data[AuthProvider.Google] ||
        identities.data[AuthProvider.Google].length === 0
      ) {
        throw new RecnetError(
          ErrorCode.ZOD_VALIDATION_ERROR,
          HttpStatus.UNAUTHORIZED,
          "Invalid Google provider identity"
        );
      }

      providerId = identities.data[AuthProvider.Google][0];
    }

    if (!providerId) {
      throw new RecnetError(
        ErrorCode.ZOD_VALIDATION_ERROR,
        HttpStatus.UNAUTHORIZED,
        "Invalid providerId"
      );
    }

    return {
      provider,
      providerId,
    };
  }
);

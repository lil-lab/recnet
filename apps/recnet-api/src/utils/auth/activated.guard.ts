import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
} from "@nestjs/common";

import UserRepository from "@recnet-api/database/repository/user.repository";

import { recnetJwtPayloadSchema } from "@recnet/recnet-jwt";

import { RecnetError } from "../error/recnet.error";
import { ErrorCode } from "../error/recnet.error.const";

@Injectable()
export class ActivatedGuard implements CanActivate {
  constructor(private readonly userRepository: UserRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const recnetJwtPayload = recnetJwtPayloadSchema.safeParse(request.user);
    if (!recnetJwtPayload.success) {
      throw new RecnetError(
        ErrorCode.ZOD_VALIDATION_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        recnetJwtPayload.error.message
      );
    }

    const userId = recnetJwtPayload.data.recnet.userId;
    const isActivated = await this.userRepository.isActivated(userId);

    if (!isActivated) {
      throw new RecnetError(
        ErrorCode.ACCOUNT_NOT_ACTIVATED,
        HttpStatus.UNAUTHORIZED
      );
    }

    return true;
  }
}

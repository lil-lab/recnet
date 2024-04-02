import { HttpStatus, Inject, Injectable } from "@nestjs/common";

import InviteCodeRepository from "@recnet-api/database/repository/inviteCode.repository";
import UserRepository from "@recnet-api/database/repository/user.repository";
import {
  CreateUserInput,
  User as DbUser,
  UserPreview as DbUserPreview,
  UpdateUserInput,
} from "@recnet-api/database/repository/user.repository.type";
import { UserFilterBy } from "@recnet-api/database/repository/user.repository.type";
import { getOffset } from "@recnet-api/utils";
import { RecnetError } from "@recnet-api/utils/error/recnet.error";
import { ErrorCode } from "@recnet-api/utils/error/recnet.error.const";

import { AuthProvider } from "@recnet/recnet-jwt";

import { CreateUserDto } from "./dto/create.user.dto";
import { UpdateUserDto } from "./dto/update.user.dto";
import { User } from "./entities/user.entity";
import { UserPreview } from "./entities/user.preview.entity";
import { GetUsersResponse } from "./user.response";

@Injectable()
export class UserService {
  constructor(
    @Inject(UserRepository)
    private readonly userRepository: UserRepository,
    @Inject(InviteCodeRepository)
    private readonly inviteCodeRepository: InviteCodeRepository
  ) {}

  public async getUsers(
    page: number,
    pageSize: number,
    filter: UserFilterBy
  ): Promise<GetUsersResponse> {
    const usersCount: number = await this.userRepository.countUsers(filter);
    const users: DbUserPreview[] = await this.userRepository.findUsers(
      page,
      pageSize,
      filter
    );
    const userPreviews: UserPreview[] = users.map(this.transformUserPreview);

    return {
      hasNext: users.length + getOffset(page, pageSize) < usersCount,
      users: userPreviews,
    };
  }

  public async getUser(userId: string): Promise<User> {
    const user: DbUser = await this.userRepository.findUserById(userId);
    return this.transformUser(user);
  }

  public async login(provider: AuthProvider, providerId: string) {
    const user: DbUser = await this.userRepository.login(provider, providerId);
    return this.transformUser(user);
  }

  public async createUser(
    provider: AuthProvider,
    providerId: string,
    dto: CreateUserDto
  ): Promise<User> {
    this.validateInviteCode(dto.inviteCode);

    const createUserInput: CreateUserInput = {
      ...dto,
      provider,
      providerId,
    };
    const user: DbUser = await this.userRepository.createUser(createUserInput);
    return this.transformUser(user);
  }

  public async updateUser(userId: string, dto: UpdateUserDto): Promise<User> {
    const updateUserInput: UpdateUserInput = { ...dto };
    const user: DbUser = await this.userRepository.updateUser(
      userId,
      updateUserInput
    );
    return this.transformUser(user);
  }

  public async validateHandle(handle: string): Promise<void> {
    const user = await this.userRepository.findUserByHandle(handle);
    if (user) {
      throw new RecnetError(ErrorCode.HANDLE_EXISTS, HttpStatus.BAD_REQUEST);
    }
  }

  public async validateInviteCode(inviteCode: string): Promise<void> {
    const inviteCodeFound =
      await this.inviteCodeRepository.findInviteCode(inviteCode);

    let errorMessage: string | undefined;
    if (!inviteCodeFound) {
      errorMessage = "Invite code does not exist.";
    } else if (inviteCodeFound.usedById) {
      errorMessage = "Invite code has already been used.";
    }
    throw new RecnetError(
      ErrorCode.INVALID_INVITE_CODE,
      HttpStatus.BAD_REQUEST,
      errorMessage
    );
  }

  private async transformUser(user: DbUser): Promise<User> {
    const followingUserIds: string[] = user.following.map(
      (followingUser) => followingUser.followingId
    );

    const followingUsers: UserPreview[] = (
      await this.userRepository.findUserPreviewByIds(followingUserIds)
    ).map(this.transformUserPreview);

    return {
      id: user.id,
      handle: user.handle,
      displayName: user.displayName,
      photoUrl: user.photoUrl,
      affiliation: user.affiliation,
      bio: user.bio,
      numFollowers: user.followedBy.length,
      email: user.email,
      role: user.role,
      following: followingUsers,
    };
  }

  private transformUserPreview(user: DbUserPreview): UserPreview {
    return {
      id: user.id,
      handle: user.handle,
      displayName: user.displayName,
      photoUrl: user.photoUrl,
      affiliation: user.affiliation,
      bio: user.bio,
      numFollowers: user.followedBy.length,
    };
  }
}

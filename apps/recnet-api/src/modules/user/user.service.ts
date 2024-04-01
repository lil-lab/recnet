import { Inject, Injectable } from "@nestjs/common";

import UserRepository from "@recnet-api/database/repository/user.repository";
import {
  User as DbUser,
  UserPreview as DbUserPreview,
} from "@recnet-api/database/repository/user.repository.type";
import { UserFilterBy } from "@recnet-api/database/repository/user.repository.type";
import { getOffset } from "@recnet-api/utils";

import { AuthProvider } from "@recnet/recnet-jwt";

import { CreateUserDto } from "./dto/create.user.dto";
import { User } from "./entities/user.entity";
import { UserPreview } from "./entities/user.preview.entity";
import { GetUsersResponse } from "./user.response";

@Injectable()
export class UserService {
  constructor(
    @Inject(UserRepository)
    private readonly userRepository: UserRepository
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
    const createUserInput = {
      provider,
      providerId,
      handle: dto.handle,
      displayName: dto.displayName,
      photoUrl: dto.photoUrl,
      affiliation: dto.affiliation,
      bio: dto.bio,
      email: dto.email,
      role: dto.role,
      inviteCode: dto.inviteCode,
    };
    const user: DbUser = await this.userRepository.createUser(createUserInput);
    return this.transformUser(user);
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

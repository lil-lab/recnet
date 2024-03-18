import { Inject, Injectable } from "@nestjs/common";

import { GetUsersResponse, UserPreview } from "@recnet/recnet-api-model";

import UserRepository from "@recnet-api/database/repository/user.repository";
import { UserPreview as DbUserPreview } from "@recnet-api/database/repository/user.repository.type";
import { getOffset } from "@recnet-api/utils";

import { UserFilterBy } from "./user.type";

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
    const userPreviews: UserPreview[] = users.map((user) => ({
      id: user.id,
      handle: user.handle,
      displayName: user.displayName,
      photoUrl: user.photoUrl,
      affiliation: user.affiliation,
      bio: user.bio,
      numFollowers: user.followedBy.length,
    }));

    return {
      hasNext: users.length + getOffset(page, pageSize) < usersCount,
      users: userPreviews,
    };
  }
}

import { Injectable } from "@nestjs/common";
import { Prisma, Provider } from "@prisma/client";

import PrismaConnectionProvider from "@recnet-api/database/prisma/prisma.connection.provider";
import { getOffset } from "@recnet-api/utils";

import { AuthProvider } from "@recnet/recnet-jwt";

import {
  User,
  UserPreview,
  user,
  userPreview,
  UserFilterBy,
  CreateUserInput,
  UpdateUserInput,
} from "./user.repository.type";

@Injectable()
export default class UserRepository {
  constructor(private readonly prisma: PrismaConnectionProvider) {}

  public async findUsers(
    page: number,
    pageSize: number,
    filter: UserFilterBy = {}
  ): Promise<UserPreview[]> {
    const where: Prisma.UserWhereInput =
      this.transformUserFilterByToPrismaWhere(filter);
    const users = await this.prisma.user.findMany({
      select: userPreview.select,
      where,
      take: pageSize,
      skip: getOffset(page, pageSize),
      orderBy: { id: Prisma.SortOrder.asc },
    });

    return users.map(this.excludeNonActivatedFollowingRecord);
  }

  public async findAllUsers(activatedOnly = true): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      select: user.select,
      where: activatedOnly ? { isActivated: true } : {},
    });
    return users.map(this.excludeNonActivatedFollowingRecord);
  }

  public async countUsers(filter: UserFilterBy = {}): Promise<number> {
    const where: Prisma.UserWhereInput =
      this.transformUserFilterByToPrismaWhere(filter);

    return this.prisma.user.count({ where });
  }

  public async findUserById(userId: string): Promise<User> {
    const where = { id: userId };
    const userFound = await this.prisma.user.findUniqueOrThrow({
      where,
      select: user.select,
    });
    return this.excludeNonActivatedFollowingRecord(userFound);
  }

  public async findUserByHandle(handle: string): Promise<User | null> {
    const userFound = await this.prisma.user.findFirst({
      where: { handle },
      select: user.select,
    });
    return userFound
      ? this.excludeNonActivatedFollowingRecord(userFound)
      : null;
  }

  public async findUserPreviewByIds(userIds: string[]): Promise<UserPreview[]> {
    const users = await this.prisma.user.findMany({
      select: userPreview.select,
      where: {
        id: { in: userIds },
      },
    });
    return users.map(this.excludeNonActivatedFollowingRecord);
  }

  public async login(
    provider: AuthProvider,
    providerId: string
  ): Promise<User> {
    const prismaProvider = this.transformToPrismaProvider(provider);
    const where = {
      provider_providerId: { provider: prismaProvider, providerId },
    };

    const userUpdated = await this.prisma.user.update({
      where,
      data: { lastLoginAt: new Date() },
      select: user.select,
    });
    return this.excludeNonActivatedFollowingRecord(userUpdated);
  }

  public async createUser(createUserInput: CreateUserInput): Promise<User> {
    const prismaCreateUserInput: Prisma.UserCreateInput = {
      ...createUserInput,
      provider: this.transformToPrismaProvider(createUserInput.provider),
      lastLoginAt: new Date(),
    };

    return this.prisma.$transaction(async (prisma) => {
      const userInTransaction = await prisma.user.create({
        data: prismaCreateUserInput,
        select: user.select,
      });

      await prisma.inviteCode.update({
        where: { code: createUserInput.inviteCode },
        data: {
          usedById: userInTransaction.id,
          usedAt: new Date(),
        },
      });

      return this.excludeNonActivatedFollowingRecord(userInTransaction);
    });
  }

  public async updateUser(
    userId: string,
    updateUserInput: UpdateUserInput
  ): Promise<User> {
    const where = { id: userId };
    const updatedUser = await this.prisma.user.update({
      where,
      data: updateUserInput,
      select: user.select,
    });
    return this.excludeNonActivatedFollowingRecord(updatedUser);
  }

  public async updateUserActivate(
    userId: string,
    isActivated: boolean
  ): Promise<User> {
    const where = { id: userId };
    const updatedUser = await this.prisma.user.update({
      where,
      data: { isActivated },
      select: user.select,
    });
    return this.excludeNonActivatedFollowingRecord(updatedUser);
  }

  public async isActivated(userId: string): Promise<boolean> {
    const user = await this.findUserById(userId);
    return user.isActivated;
  }

  private transformUserFilterByToPrismaWhere(
    filter: UserFilterBy
  ): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {};
    const insensitiveContains = (field: string, word: string) => ({
      [field]: {
        contains: word,
        mode: Prisma.QueryMode.insensitive,
      },
    });
    if (filter.handle) {
      where.handle = filter.handle;
    }
    if (filter.id) {
      where.id = filter.id;
    }
    if (filter.isActivated !== undefined) {
      where.isActivated = filter.isActivated;
    }

    if (filter.keyword) {
      const keywords = filter.keyword.split(" ");
      const searchStr = keywords.join(" | ");
      where.OR = [
        { handle: { search: searchStr } },
        { displayName: { search: searchStr } },
        { affiliation: { search: searchStr } },
        // add contains search to handle partial match
        ...keywords.map((w) => insensitiveContains("handle", w)),
        ...keywords.map((w) => insensitiveContains("displayName", w)),
        ...keywords.map((w) => insensitiveContains("affiliation", w)),
      ];
    }
    return where;
  }

  private excludeNonActivatedFollowingRecord<U extends User | UserPreview>(
    user: U
  ): U {
    user.followedBy = user.followedBy.filter((fr) => fr.followedBy.isActivated);

    // if user is User, filter following
    if ("following" in user) {
      user.following = user.following.filter((f) => f.following.isActivated);
    }

    return user;
  }

  private transformToPrismaProvider(provider: AuthProvider): Provider {
    switch (provider) {
      case AuthProvider.Google:
        return Provider.GOOGLE;
      default:
        throw new Error("Provider not supported");
    }
  }
}

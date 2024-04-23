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
    return this.prisma.user.findMany({
      select: userPreview.select,
      where,
      take: pageSize,
      skip: getOffset(page, pageSize),
      orderBy: { id: Prisma.SortOrder.asc },
    });
  }

  public async findAllUsers(): Promise<User[]> {
    return this.prisma.user.findMany({
      select: user.select,
    });
  }

  public async countUsers(filter: UserFilterBy = {}): Promise<number> {
    const where: Prisma.UserWhereInput =
      this.transformUserFilterByToPrismaWhere(filter);

    return this.prisma.user.count({ where });
  }

  public async findUserById(userId: string): Promise<User> {
    const where = { id: userId };
    return this.prisma.user.findUniqueOrThrow({
      where,
      select: user.select,
    });
  }

  public async findUserByHandle(handle: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { handle },
      select: user.select,
    });
  }

  public async findUserPreviewByIds(userIds: string[]): Promise<UserPreview[]> {
    return this.prisma.user.findMany({
      select: userPreview.select,
      where: { id: { in: userIds } },
    });
  }

  public async login(
    provider: AuthProvider,
    providerId: string
  ): Promise<User> {
    const prismaProvider = this.transformToPrismaProvider(provider);
    const where = {
      provider_providerId: { provider: prismaProvider, providerId },
    };

    return this.prisma.user.update({
      where,
      data: { lastLoginAt: new Date() },
      select: user.select,
    });
  }

  public async createUser(createUserInput: CreateUserInput): Promise<User> {
    const prismaCreateUserInput: Prisma.UserCreateInput = {
      ...createUserInput,
      provider: this.transformToPrismaProvider(createUserInput.provider),
      lastLoginAt: new Date(),
    };

    return await this.prisma.$transaction(async (prisma) => {
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

      return userInTransaction;
    });
  }

  public async updateUser(
    userId: string,
    updateUserInput: Prisma.UserUpdateInput
  ): Promise<User> {
    const where = { id: userId };
    return this.prisma.user.update({
      where,
      data: updateUserInput,
      select: user.select,
    });
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

  private transformToPrismaProvider(provider: AuthProvider): Provider {
    switch (provider) {
      case AuthProvider.Google:
        return Provider.GOOGLE;
      default:
        throw new Error("Provider not supported");
    }
  }
}

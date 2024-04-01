import { HttpStatus, Injectable } from "@nestjs/common";
import { Prisma, Provider } from "@prisma/client";

import PrismaConnectionProvider from "@recnet-api/database/prisma/prisma.connection.provider";
import { getOffset } from "@recnet-api/utils";
import { RecnetError } from "@recnet-api/utils/error/recnet.error";
import { ErrorCode } from "@recnet-api/utils/error/recnet.error.const";

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

  public async countUsers(filter: UserFilterBy = {}): Promise<number> {
    const where: Prisma.UserWhereInput =
      this.transformUserFilterByToPrismaWhere(filter);

    return this.prisma.user.count({ where });
  }

  public async findUserById(userId: string): Promise<User> {
    let userFound: User;
    try {
      userFound = await this.prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: user.select,
      });
    } catch (error) {
      throw new RecnetError(ErrorCode.DB_USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return userFound;
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
    let loginUser: User;
    try {
      // update last login time
      loginUser = await this.prisma.user.update({
        where,
        data: { lastLoginAt: new Date() },
        select: user.select,
      });
    } catch (error) {
      throw new RecnetError(ErrorCode.DB_USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return loginUser;
  }

  public async createUser(createUserInput: CreateUserInput): Promise<User> {
    const prismaCreateUserInput: Prisma.UserCreateInput = {
      ...createUserInput,
      provider: this.transformToPrismaProvider(createUserInput.provider),
      lastLoginAt: new Date(),
    };

    let createdUser: User;
    try {
      createdUser = await this.prisma.$transaction(async (prisma) => {
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : undefined;
      throw new RecnetError(
        ErrorCode.DB_CREATE_USER_ERROR,
        HttpStatus.BAD_REQUEST,
        errorMessage
      );
    }

    return createdUser;
  }

  private transformUserFilterByToPrismaWhere(
    filter: UserFilterBy
  ): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {};
    if (filter.handle) {
      where.handle = filter.handle;
    }
    if (filter.id) {
      where.id = filter.id;
    }

    if (filter.keyword) {
      const searchStr = filter.keyword.split(" ").join(" | ");
      where.OR = [
        { handle: { search: searchStr } },
        { displayName: { search: searchStr } },
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

import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import PrismaConnectionProvider from "@recnet-api/database/prisma/prisma.connection.provider";

import {
  digitalLibrary,
  DigitalLibraryFilterBy,
} from "./digital-library.repository.type";
@Injectable()
export default class DigitalLibraryRepository {
  constructor(private readonly prisma: PrismaConnectionProvider) {}

  public async findAll() {
    return this.prisma.digitalLibrary.findMany({
      orderBy: {
        rank: Prisma.SortOrder.asc,
      },
      select: digitalLibrary.select,
    });
  }

  public async findById(id: number) {
    return this.prisma.digitalLibrary.findUniqueOrThrow({
      where: { id },
      select: digitalLibrary.select,
    });
  }

  public async findDigitalLibraries(filter: DigitalLibraryFilterBy) {
    return this.prisma.digitalLibrary.findMany({
      where: filter,
      select: digitalLibrary.select,
    });
  }
}

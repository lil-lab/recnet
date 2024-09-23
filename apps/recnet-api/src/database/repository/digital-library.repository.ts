import { Injectable } from "@nestjs/common";

import PrismaConnectionProvider from "@recnet-api/database/prisma/prisma.connection.provider";

import { digitalLibrary } from "./digital-library.repository.type";
@Injectable()
export default class DigitalLibraryRepository {
  constructor(private readonly prisma: PrismaConnectionProvider) {}

  public async findAll() {
    return this.prisma.digitalLibrary.findMany({
      orderBy: {
        rank: "asc",
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
}

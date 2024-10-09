import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import PrismaConnectionProvider from "@recnet-api/database/prisma/prisma.connection.provider";

import {
  CreateDigitalLibraryInput,
  DigitalLibrary,
  digitalLibrary,
  DigitalLibraryFilterBy,
  UpdateDigitalLibrariesRankInput,
  UpdateDigitalLibraryInput,
} from "./digital-library.repository.type";
@Injectable()
export default class DigitalLibraryRepository {
  constructor(private readonly prisma: PrismaConnectionProvider) {}

  public async findAll(): Promise<Array<DigitalLibrary>> {
    return this.prisma.digitalLibrary.findMany({
      orderBy: {
        rank: Prisma.SortOrder.asc,
      },
      select: digitalLibrary.select,
    });
  }

  public async findById(id: number): Promise<DigitalLibrary> {
    return this.prisma.digitalLibrary.findUniqueOrThrow({
      where: { id },
      select: digitalLibrary.select,
    });
  }

  public async findMany(
    filter: DigitalLibraryFilterBy
  ): Promise<Array<DigitalLibrary>> {
    return this.prisma.digitalLibrary.findMany({
      where: filter,
      select: digitalLibrary.select,
    });
  }

  public async create(
    data: CreateDigitalLibraryInput
  ): Promise<DigitalLibrary> {
    return this.prisma.digitalLibrary.create({
      data,
      select: digitalLibrary.select,
    });
  }

  public async update(
    id: number,
    data: UpdateDigitalLibraryInput
  ): Promise<DigitalLibrary> {
    return this.prisma.digitalLibrary.update({
      where: { id },
      data,
      select: digitalLibrary.select,
    });
  }

  public async delete(id: number): Promise<DigitalLibrary> {
    return this.prisma.digitalLibrary.delete({
      where: { id },
    });
  }

  public async updateRanks(
    data: UpdateDigitalLibrariesRankInput
  ): Promise<void> {
    // Update temp ranks to avoid rank conflicts
    const tempUpdates = data.map(({ id }, idx) =>
      this.prisma.digitalLibrary.update({
        where: { id },
        data: { rank: -1 * (idx + 1) },
      })
    );

    const updates = data.map(({ id, rank }) =>
      this.prisma.digitalLibrary.update({
        where: { id },
        data: { rank },
      })
    );

    await this.prisma.$transaction([...tempUpdates, ...updates]);
  }
}

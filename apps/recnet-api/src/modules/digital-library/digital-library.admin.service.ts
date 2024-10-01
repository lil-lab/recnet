import { Inject, Injectable } from "@nestjs/common";

import DigitalLibraryRepository from "@recnet-api/database/repository/digital-library.repository";
import {
  DigitalLibrary as DbDigitalLibrary,
  DigitalLibraryFilterBy,
} from "@recnet-api/database/repository/digital-library.repository.type";

import { GetDigitalLibrariesResponse } from "./digital-library.response";
import { CreateDigitalLibraryDto } from "./dto/create.digital-library.dto";
import {
  UpdateDigitalLibrariesRankDto,
  UpdateDigitalLibraryDto,
} from "./dto/update.digital-library.dto";
import { DigitalLibrary } from "./entities/digital-library.entity";

@Injectable()
export class DigitalLibraryAdminService {
  constructor(
    @Inject(DigitalLibraryRepository)
    private readonly digitalLibraryRepository: DigitalLibraryRepository
  ) {}

  public async getDigitalLibraries(
    filter: DigitalLibraryFilterBy
  ): Promise<GetDigitalLibrariesResponse> {
    const digitalLibraries =
      await this.digitalLibraryRepository.findMany(filter);

    return {
      digitalLibraries: digitalLibraries.map(this.transformDigitalLibrary),
    };
  }

  public async createDigitalLibrary(
    dto: CreateDigitalLibraryDto
  ): Promise<DigitalLibrary> {
    const dbDigitalLibrary = await this.digitalLibraryRepository.create(dto);
    return this.transformDigitalLibrary(dbDigitalLibrary);
  }

  public async updateDigitalLibrary(
    id: number,
    dto: UpdateDigitalLibraryDto
  ): Promise<DigitalLibrary> {
    const updatedDbDigitalLibrary = await this.digitalLibraryRepository.update(
      id,
      dto
    );
    return this.transformDigitalLibrary(updatedDbDigitalLibrary);
  }

  public async deleteDigitalLibrary(id: number): Promise<void> {
    await this.digitalLibraryRepository.delete(id);
  }

  public async updateDigitalLibrariesRank(
    dto: UpdateDigitalLibrariesRankDto
  ): Promise<GetDigitalLibrariesResponse> {
    await this.digitalLibraryRepository.updateRanks(dto);
    const digitalLibraries = await this.digitalLibraryRepository.findAll();
    return {
      digitalLibraries: digitalLibraries.map(this.transformDigitalLibrary),
    };
  }

  private transformDigitalLibrary(
    digitalLibrary: DbDigitalLibrary
  ): DigitalLibrary {
    return {
      id: digitalLibrary.id,
      name: digitalLibrary.name,
      regex: digitalLibrary.regex,
      rank: digitalLibrary.rank,
      isVerified: digitalLibrary.isVerified,
    };
  }
}

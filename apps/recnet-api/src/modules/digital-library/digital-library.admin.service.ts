import { Inject, Injectable } from "@nestjs/common";

import DigitalLibraryRepository from "@recnet-api/database/repository/digital-library.repository";
import {
  DigitalLibrary as DbDigitalLibrary,
  DigitalLibraryFilterBy,
} from "@recnet-api/database/repository/digital-library.repository.type";

import { GetDigitalLibrariesResponse } from "./digital-library.response";
import { CreateDigitalLibraryDto } from "./dto/create.digital-library.dto";
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
    const createAnnouncementInput = { ...dto };
    const dbDigitalLibrary = await this.digitalLibraryRepository.create(
      createAnnouncementInput
    );
    return this.transformDigitalLibrary(dbDigitalLibrary);
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

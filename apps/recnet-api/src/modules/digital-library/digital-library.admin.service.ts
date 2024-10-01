import { Inject, Injectable } from "@nestjs/common";

import DigitalLibraryRepository from "@recnet-api/database/repository/digital-library.repository";
import {
  DigitalLibrary as DbDigitalLibrary,
  DigitalLibraryFilterBy,
} from "@recnet-api/database/repository/digital-library.repository.type";

import { GetDigitalLibrariesResponse } from "./digital-library.response";
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
      await this.digitalLibraryRepository.findDigitalLibraries(filter);

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

import { Module } from "@nestjs/common";

import { DbRepositoryModule } from "@recnet-api/database/repository/db.repository.module";
import DigitalLibraryRepository from "@recnet-api/database/repository/digital-library.repository";

import { ArXivService } from "./arxiv.service";
import { DigitalLibraryService } from "./digital-library.service";
import { DIGITAL_LIBRARY } from "./digital-libray.const";

const digitalLibraryFactory = (
  digitalLibraryRepository: DigitalLibraryRepository
): DigitalLibraryService => {
  return new ArXivService(digitalLibraryRepository, 2);
};

@Module({
  providers: [
    {
      provide: DIGITAL_LIBRARY,
      useFactory: digitalLibraryFactory,
      inject: [DigitalLibraryRepository],
    },
  ],
  imports: [DbRepositoryModule],
  exports: [DIGITAL_LIBRARY],
})
export class DigitalLibraryModule {}

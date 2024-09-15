import { Module } from "@nestjs/common";

import { DbRepositoryModule } from "@recnet-api/database/repository/db.repository.module";

import { ArXivService } from "./arxiv.service";
import { DigitalLibraryService } from "./digital-library.service";
import { DIGITAL_LIBRARY } from "./digital-libray.const";

const digitalLibraryFactory = (): DigitalLibraryService => {
  return new ArXivService();
};

@Module({
  providers: [
    {
      provide: DIGITAL_LIBRARY,
      useFactory: digitalLibraryFactory,
    },
  ],
  imports: [DbRepositoryModule],
  exports: [DIGITAL_LIBRARY],
})
export class DigitalLibraryModule {}

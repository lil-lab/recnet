import { Module, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";

import { DbRepositoryModule } from "@recnet-api/database/repository/db.repository.module";
import DigitalLibraryRepository from "@recnet-api/database/repository/digital-library.repository";

import { DigitalLibraryAdminService } from "./digital-library.admin.service";
import { DIGITAL_LIBRARY } from "./digital-library.const";
import { DigitalLibraryController } from "./digital-library.controller";
import { DigitalLibraryServiceFactory } from "./digital-library.service";

@Module({
  controllers: [DigitalLibraryController],
  providers: [
    DigitalLibraryAdminService,
    {
      provide: DIGITAL_LIBRARY,
      useFactory: DigitalLibraryServiceFactory,
      inject: [DigitalLibraryRepository, REQUEST],
      scope: Scope.REQUEST,
    },
  ],
  imports: [DbRepositoryModule],
  exports: [DIGITAL_LIBRARY],
})
export class DigitalLibraryModule {}

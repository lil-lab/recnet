import { Module } from "@nestjs/common";

import { DbRepositoryModule } from "@recnet-api/database/repository/db.repository.module";
import { DigitalLibraryModule } from "@recnet-api/modules/digital-library/digital-library.module";

import { ArticleController } from "./article.controller";
import { ArticleService } from "./article.service";

@Module({
  controllers: [ArticleController],
  providers: [ArticleService],
  imports: [DbRepositoryModule, DigitalLibraryModule],
})
export class ArticleModule {}

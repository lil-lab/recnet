import { Module } from "@nestjs/common";

import { DbRepositoryModule } from "@recnet-api/database/repository/db.repository.module";

import { ArticleController } from "./article.controller";
import { ArticleService } from "./article.service";

@Module({
  controllers: [ArticleController],
  providers: [ArticleService],
  imports: [DbRepositoryModule],
})
export class ArticleModule {}

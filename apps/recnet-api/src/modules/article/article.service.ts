import { Inject, Injectable } from "@nestjs/common";

import ArticleRepository from "@recnet-api/database/repository/article.repository";

import { GetArticleByLinkResponse } from "./article.response";

import { DigitalLibraryService } from "../digital-library/digital-library.service";
import { DIGITAL_LIBRARY } from "../digital-library/digital-libray.const";

@Injectable()
export class ArticleService {
  constructor(
    @Inject(ArticleRepository)
    private readonly articleRepository: ArticleRepository,
    @Inject(DIGITAL_LIBRARY)
    private readonly digitalLibraryService: DigitalLibraryService
  ) {}

  public async getArticleByLink(
    link: string
  ): Promise<GetArticleByLinkResponse> {
    const article = await this.articleRepository.findArticleByLink(link);

    const metadata = await this.digitalLibraryService.getMetadata(link);
    console.log(metadata);

    if (!article) {
      return {
        article: null,
      };
    }
    return {
      article: article,
    };
  }
}

import { Inject, Injectable, Logger } from "@nestjs/common";

import ArticleRepository from "@recnet-api/database/repository/article.repository";
import { CreateArticleInput } from "@recnet-api/database/repository/article.repository.type";
import { DIGITAL_LIBRARY } from "@recnet-api/modules/digital-library/digital-library.const";
import { DigitalLibraryService } from "@recnet-api/modules/digital-library/digital-library.service";
import { Metadata } from "@recnet-api/modules/digital-library/digital-library.type";

import { GetArticleByLinkResponse } from "./article.response";

@Injectable()
export class ArticleService {
  private logger = new Logger(ArticleService.name);

  constructor(
    @Inject(ArticleRepository)
    private readonly articleRepository: ArticleRepository,
    @Inject(DIGITAL_LIBRARY)
    private readonly digitalLibraryService: DigitalLibraryService | null
  ) {}

  public async getArticleByLink(
    link: string
  ): Promise<GetArticleByLinkResponse> {
    let unifiedLink = link;

    // If digital library service is available, try to get the unified link
    if (this.digitalLibraryService) {
      unifiedLink = await this.digitalLibraryService.getUnifiedLink(link);
    }

    // Try to find the article in the database using the unified link
    let article = await this.articleRepository.findArticleByLink(unifiedLink);
    if (article) {
      return { article };
    }

    // If no article found, try to get metadata using the digital library service
    if (this.digitalLibraryService) {
      try {
        const metadata = await this.digitalLibraryService.getMetadata(link);
        const articleInput = this.transformMetadata(metadata, unifiedLink);

        article = await this.articleRepository.createArticle(articleInput);
        return { article };
      } catch (error) {
        this.logger.error(error);
      }
    }

    // If no article found and no metadata available, return null
    return {
      article: null,
    };
  }

  private transformMetadata(
    metadata: Metadata,
    link: string
  ): CreateArticleInput {
    return {
      ...metadata,
      link,
      doi: null,
    };
  }
}

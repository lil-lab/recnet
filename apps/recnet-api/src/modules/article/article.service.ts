import { Inject, Injectable } from "@nestjs/common";

import ArticleRepository from "@recnet-api/database/repository/article.repository";
import { CreateArticleInput } from "@recnet-api/database/repository/article.repository.type";

import { GetArticleByLinkResponse } from "./article.response";

import { DigitalLibraryService } from "../digital-library/digital-library.service";
import { DIGITAL_LIBRARY } from "../digital-library/digital-libray.const";
import { Metadata } from "../digital-library/entities/metadata.entity";

@Injectable()
export class ArticleService {
  constructor(
    @Inject(ArticleRepository)
    private readonly articleRepository: ArticleRepository,
    @Inject(DIGITAL_LIBRARY)
    private readonly digitalLibraryService: DigitalLibraryService | null
  ) {}

  public async getArticleByLink(
    link: string
  ): Promise<GetArticleByLinkResponse> {
    let unifiedLink: string = link;
    let metadata: Metadata | null = null;

    // If digitalLibraryService is available, fetch metadata and update unifiedLink
    if (this.digitalLibraryService) {
      metadata = await this.digitalLibraryService.getMetadata(link);
      unifiedLink = metadata.link || link;
    }

    // Try to find the article in the database using the unified link
    let article = await this.articleRepository.findArticleByLink(unifiedLink);
    if (article) {
      return { article };
    }

    // If metadata is available, create a new article using the metadata from the digital library
    if (metadata !== null) {
      const articleInput = this.transformMetadata(metadata, link);

      article = await this.articleRepository.createArticle(articleInput);
      return { article };
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
      link: metadata.link || link,
      doi: null,
      title: metadata.title || "",
      author: metadata.author || "",
      year: metadata.year || 0,
      month: metadata.month || null,
      isVerified: metadata.isVerified || false,
    };
  }
}

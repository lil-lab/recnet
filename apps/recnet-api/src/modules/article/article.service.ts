import { Inject, Injectable, Logger } from "@nestjs/common";

import ArticleRepository from "@recnet-api/database/repository/article.repository";
import { CreateArticleInput } from "@recnet-api/database/repository/article.repository.type";
import { DIGITAL_LIBRARY } from "@recnet-api/modules/digital-library/digital-library.const";
import { DigitalLibraryService } from "@recnet-api/modules/digital-library/digital-library.service";
import { Metadata } from "@recnet-api/modules/digital-library/digital-library.type";
import { NotFoundException } from "@nestjs/common";

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

  // public async getArticleByLink(
  //   link: string
  // ): Promise<GetArticleByLinkResponse> {
  //   let unifiedLink = link;
  //
  //   // If digital library service is available, try to get the unified link
  //   if (this.digitalLibraryService) {
  //     unifiedLink = await this.digitalLibraryService.getUnifiedLink(link);
  //   }
  //
  //   // Try to find the article in the database using the unified link
  //   let article = await this.articleRepository.findArticleByLink(unifiedLink);
  //   if (article) {
  //     return { article };
  //   }
  //
  //   // If no article found, try to get metadata using the digital library service
  //   if (this.digitalLibraryService) {
  //     try {
  //       const metadata = await this.digitalLibraryService.getMetadata(link);
  //       const articleInput = this.transformMetadata(metadata, unifiedLink);
  //
  //       article = await this.articleRepository.createArticle(articleInput);
  //       return { article };
  //     } catch (error) {
  //       this.logger.error(error);
  //     }
  //   }
  //
  //   // If no article found and no metadata available, return null
  //   return {
  //     article: null,
  //   };
  // }

  public async getArticleByLink(
    link: string,
    fetchFromDigitalLibrary: boolean = true
  ): Promise<GetArticleByLinkResponse> {
    let unifiedLink = link;

    if (fetchFromDigitalLibrary && this.digitalLibraryService) {
      unifiedLink = await this.digitalLibraryService.getUnifiedLink(link);
    }

    let article = await this.articleRepository.findArticleByLink(unifiedLink);
    if (article) {
      return { article };
    }

    if (fetchFromDigitalLibrary && this.digitalLibraryService) {
      try {
        const metadata = await this.digitalLibraryService.getMetadata(link);
        const articleInput = this.transformMetadata(metadata, unifiedLink);
        article = await this.articleRepository.createArticle(articleInput);
        return { article };
      } catch (error) {
        this.logger.error(error);
      }
    }

    return { article: null };
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

  // public async getDbArticleByLink(
  //   link: string
  // ): Promise<GetArticleByLinkResponse> {
  //   const article = await this.articleRepository.findArticleByLink(link);
  //   if (article) {
  //     return { article };
  //   }
  //
  //   // If no article found and no metadata available, return null
  //   return {
  //     article: null,
  //   };
  // }

  public async updateArticleByLink(
    link: string,
    updateData: Partial<CreateArticleInput>
  ) {
    const existing = await this.articleRepository.findArticleByLink(link);
    if (!existing) {
      throw new NotFoundException(`Article not found by link=${link}`);
    }

    const updated = await this.articleRepository.updateArticle(
      existing.id,
      updateData
    );

    return updated;
  }
}

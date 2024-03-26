import { Inject, Injectable } from "@nestjs/common";

import ArticleRepository from "@recnet-api/database/repository/article.repository";

import { GetArticleByLinkResponse } from "./article.response";

@Injectable()
export class ArticleService {
  constructor(
    @Inject(ArticleRepository)
    private readonly articleRepository: ArticleRepository
  ) {}

  public async getArticleByLink(
    link: string
  ): Promise<GetArticleByLinkResponse> {
    const article = await this.articleRepository.findArticleByLink(link);
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

import { Injectable } from "@nestjs/common";

import PrismaConnectionProvider from "@recnet-api/database/prisma/prisma.connection.provider";
import {
  article,
  Article,
  CreateArticleInput,
} from "@recnet-api/database/repository/article.repository.type";

@Injectable()
export default class ArticleRepository {
  constructor(private readonly prisma: PrismaConnectionProvider) {}

  public async findArticleByLink(link: string): Promise<Article | null> {
    return this.prisma.article.findFirst({
      where: {
        link: link,
      },
      select: article.select,
    });
  }

  public async findArticleById(id: string): Promise<Article | null> {
    return this.prisma.article.findFirst({
      where: {
        id: id,
      },
      select: article.select,
    });
  }

  public async createArticle(
    articleData: CreateArticleInput
  ): Promise<Article> {
    return this.prisma.article.create({
      data: articleData,
      select: article.select,
    });
  }

  public async updateArticle(
    articleId: string,
    data: Partial<CreateArticleInput>
  ): Promise<Article> {
    return this.prisma.article.update({
      where: { id: articleId },
      data,
      select: article.select,
    });
  }
}

import { Body, Controller, Get, NotFoundException, Patch, Query, UseFilters, UsePipes } from "@nestjs/common";
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
} from "@nestjs/swagger";

import { Auth } from "@recnet-api/utils/auth/auth.decorator";
import { RecnetExceptionFilter } from "@recnet-api/utils/filters/recnet.exception.filter";
import { ZodValidationBodyPipe, ZodValidationQueryPipe } from "@recnet-api/utils/pipes/zod.validation.pipe";

import { AdminUpdateArticleDtoSchema, getArticlesParamsSchema } from "@recnet/recnet-api-model";

import { GetArticleByLinkResponse } from "./article.response";
import { ArticleService } from "./article.service";
import { QueryArticleDto } from "./dto/query.article.dto";
import { UpdateArticleDto } from "@recnet-api/modules/rec/dto/update.rec.dto";
import { AdminUpdateArticleDto } from "@recnet-api/modules/article/dto/update.article.admin.dto";

@ApiTags("articles")
@Controller("articles")
@UseFilters(RecnetExceptionFilter)
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @ApiOperation({
    summary: "Get Article By Link",
    description:
      "Get article by link. If the useDigitalLibrary option is true and article is not found in the database, it will try to get metadata using the digital library service.Otherwise it will only query from database. Now it only supports arXiv.",
  })
  @ApiOkResponse({ type: GetArticleByLinkResponse })
  @ApiBearerAuth()
  @Get()
  @Auth()
  @UsePipes(new ZodValidationQueryPipe(getArticlesParamsSchema))
  public async getArticleByLink(
    @Query() dto: QueryArticleDto
  ): Promise<GetArticleByLinkResponse> {
    const { link, useDigitalLibrary } = dto;
    return this.articleService.getArticleByLink(link, useDigitalLibrary);
  }

  // @ApiOperation({
  //   summary: "Get Article in Database By Link",
  //   description:
  //     "Get article by link. If the article is not found in the database, it will return null",
  // })
  // @ApiOkResponse({ type: GetArticleByLinkResponse })
  // @ApiBearerAuth()
  // @Get("db")
  // @Auth({ allowedRoles: ["ADMIN"] })
  // @UsePipes(new ZodValidationQueryPipe(getArticlesParamsSchema))
  // public async getDbArticleByLink(
  //   @Query() dto: QueryArticleDto
  // ): Promise<GetArticleByLinkResponse> {
  //   const { link } = dto;
  //   return this.articleService.getDbArticleByLink(link);
  // }

  @ApiOperation({
    summary: "Admin update article by link",
    description: "Update an existing article's fields (title, author, etc.)",
  })
  @ApiOkResponse({
    description: "Return the updated article",
    type: GetArticleByLinkResponse,
  })
  @ApiBearerAuth()
  @Patch("admin")
  @Auth({ allowedRoles: ["ADMIN"] })
  @UsePipes(new ZodValidationBodyPipe(AdminUpdateArticleDtoSchema))
  public async updateArticleByLink(
    @Query("link") link: string,
    @Body() dto: AdminUpdateArticleDto
  ) {
    if (!link) {
      throw new NotFoundException("Must provide ?link=xxx in query");
    }

    const existingArticle = await this.articleService.getArticleByLink(link, false);
    if (!existingArticle) {
      throw new NotFoundException(`Article not found by link=${link}`);
    }

    const updatedArticle = await this.articleService.updateArticleByLink(
      link,
      dto
    );

    return { article: updatedArticle };
  }
}

import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
  UseFilters,
  UsePipes,
} from "@nestjs/common";
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
} from "@nestjs/swagger";

import { AdminUpdateArticleDto } from "@recnet-api/modules/article/dto/update.article.admin.dto";
import { UpdateArticleDto } from "@recnet-api/modules/rec/dto/update.rec.dto";
import { Auth } from "@recnet-api/utils/auth/auth.decorator";
import { RecnetExceptionFilter } from "@recnet-api/utils/filters/recnet.exception.filter";
import {
  ZodValidationBodyPipe,
  ZodValidationQueryPipe,
} from "@recnet-api/utils/pipes/zod.validation.pipe";

import {
  patchArticlesAdminRequestSchema,
  getArticlesParamsSchema,
} from "@recnet/recnet-api-model";

import { GetArticleByLinkResponse } from "./article.response";
import { ArticleService } from "./article.service";
import { QueryArticleDto } from "./dto/query.article.dto";

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
    const { link, useDigitalLibraryFallback } = dto;
    return this.articleService.getArticleByLink(
      link,
      useDigitalLibraryFallback
    );
  }

  @ApiOperation({
    summary: "Admin update article by id",
    description: "Update an existing article's fields (title, link, etc.)",
  })
  @ApiOkResponse({
    description: "Return the updated article",
  })
  @ApiBearerAuth()
  @Patch("admin/:id")
  @Auth({ allowedRoles: ["ADMIN"] })
  @UsePipes(new ZodValidationBodyPipe(patchArticlesAdminRequestSchema))
  public async updateArticleById(
    @Param("id") id: string,
    @Body() dto: AdminUpdateArticleDto
  ) {
    const updatedArticle = await this.articleService.updateArticleById(id, dto);

    return { article: updatedArticle };
  }
}

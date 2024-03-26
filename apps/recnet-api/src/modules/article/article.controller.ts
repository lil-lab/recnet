import { Controller, Get, Query, UseFilters, UsePipes } from "@nestjs/common";
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
} from "@nestjs/swagger";

import { Auth } from "@recnet-api/utils/auth/auth.decorator";
import { RecnetExceptionFilter } from "@recnet-api/utils/filters/recnet.exception.filter";
import { ZodValidationPipe } from "@recnet-api/utils/pipes/zod.validation.pipe";

import { getArticlesParamsSchema } from "@recnet/recnet-api-model";

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
    description: "Get article by link.",
  })
  @ApiOkResponse({ type: GetArticleByLinkResponse })
  @ApiBearerAuth()
  @Get()
  @Auth()
  @UsePipes(new ZodValidationPipe(getArticlesParamsSchema))
  public async getArticleByLink(
    @Query() dto: QueryArticleDto
  ): Promise<GetArticleByLinkResponse> {
    const { link } = dto;
    return this.articleService.getArticleByLink(link);
  }
}

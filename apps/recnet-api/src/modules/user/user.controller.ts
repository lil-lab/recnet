import { Controller, Get, Query, UseFilters, UsePipes } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

import { Auth } from "@recnet-api/utils/auth/auth.decorator";
import { AuthUser } from "@recnet-api/utils/auth/auth.type";
import { User } from "@recnet-api/utils/auth/auth.user.decorator";
import { RecnetExceptionFilter } from "@recnet-api/utils/filters/recnet.exception.filter";
import { ZodValidationPipe } from "@recnet-api/utils/pipes/zod.validation.pipe";

import { getUsersParamsSchema } from "@recnet/recnet-api-model";

import { QueryUsersDto } from "./dto/query.users.dto";
import { GetUserMeResponse, GetUsersResponse } from "./user.response";
import { UserService } from "./user.service";

@ApiTags("users")
@Controller("users")
@UseFilters(RecnetExceptionFilter)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({
    summary: "Get users",
    description:
      "Get users with pagination and filter. If no filter is provided, all users are returned.",
  })
  @ApiOkResponse({ type: GetUsersResponse })
  @Get()
  @UsePipes(new ZodValidationPipe(getUsersParamsSchema))
  public async getUsers(
    @Query() dto: QueryUsersDto
  ): Promise<GetUsersResponse> {
    const { page, pageSize, ...filter } = dto;
    return this.userService.getUsers(page, pageSize, filter);
  }

  @ApiOperation({
    summary: "Get me",
    description: "Get the current user.",
  })
  @ApiOkResponse({ type: GetUsersResponse })
  @ApiBearerAuth()
  @Get("me")
  @Auth()
  public async getMe(@User() authUser: AuthUser): Promise<GetUserMeResponse> {
    const { userId } = authUser;
    const user = await this.userService.getUser(userId);
    return { user };
  }
}

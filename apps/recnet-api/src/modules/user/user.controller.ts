import { Controller, Get, Query, UseFilters, UsePipes } from "@nestjs/common";
import {
  GetUsersParams,
  GetUsersResponse,
  getUsersParamsSchema,
} from "@recnet/recnet-api-model";

import { RecnetExceptionFilter } from "@recnet-api/utils/filters/recnet.exception.filter";
import { ZodValidationPipe } from "@recnet-api/utils/pipes/zod.validation.pipe";

import { UserService } from "./user.service";

@Controller("users")
@UseFilters(RecnetExceptionFilter)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UsePipes(new ZodValidationPipe(getUsersParamsSchema))
  public async getUsers(
    @Query() dto: GetUsersParams
  ): Promise<GetUsersResponse> {
    const { page, pageSize, ...filter } = dto;
    return this.userService.getUsers(page, pageSize, filter);
  }
}

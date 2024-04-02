import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
  UseFilters,
  UsePipes,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

import { Auth, AuthFirebase } from "@recnet-api/utils/auth/auth.decorator";
import { AuthFirebaseUser, AuthUser } from "@recnet-api/utils/auth/auth.type";
import { FirebaseUser, User } from "@recnet-api/utils/auth/auth.user.decorator";
import { RecnetExceptionFilter } from "@recnet-api/utils/filters/recnet.exception.filter";
import { ZodValidationPipe } from "@recnet-api/utils/pipes/zod.validation.pipe";

import {
  deleteUserFollowParamsSchema,
  getUsersParamsSchema,
  patchUserMeRequestSchema,
  postUserFollowRequestSchema,
  postUserMeRequestSchema,
  postUserValidateHandleRequestSchema,
  postUserValidateInviteCodeRequestSchema,
} from "@recnet/recnet-api-model";

import { CreateUserDto } from "./dto/create.user.dto";
import { FollowUserDto, UnfollowUserDto } from "./dto/follow.user.dto";
import { QueryUsersDto } from "./dto/query.users.dto";
import { UpdateUserDto } from "./dto/update.user.dto";
import {
  ValidateUserHandleDto,
  ValidateUserInviteCodeDto,
} from "./dto/validate.user.dto";
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
    summary: "User login",
    description: "Get login user by provider and providerId.",
  })
  @ApiBearerAuth()
  @Get("login")
  @AuthFirebase()
  public async login(@FirebaseUser() firebaseUser: AuthFirebaseUser) {
    const { provider, providerId } = firebaseUser;
    return this.userService.login(provider, providerId);
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

  @ApiOperation({
    summary: "Create me",
    description: "Create the current user.",
  })
  @ApiCreatedResponse({ type: GetUserMeResponse })
  @ApiBearerAuth()
  @Post("/me")
  @UsePipes(new ZodValidationPipe(postUserMeRequestSchema))
  @AuthFirebase()
  public async createMe(
    @FirebaseUser() firebaseUser: AuthFirebaseUser,
    @Body() dto: CreateUserDto
  ): Promise<GetUserMeResponse> {
    const { provider, providerId } = firebaseUser;
    const user = await this.userService.createUser(provider, providerId, dto);
    return { user };
  }

  @ApiOperation({
    summary: "Update me",
    description: "Update the current user.",
  })
  @ApiOkResponse({ type: GetUserMeResponse })
  @ApiBearerAuth()
  @Patch("/me")
  @UsePipes(new ZodValidationPipe(patchUserMeRequestSchema))
  @Auth()
  public async updateMe(
    @User() authUser: AuthUser,
    @Body() dto: UpdateUserDto
  ): Promise<GetUserMeResponse> {
    const { userId } = authUser;
    const user = await this.userService.updateUser(userId, dto);
    return { user };
  }

  @ApiOperation({
    summary: "Validate handle",
    description: "Validate if the handle exists.",
  })
  @ApiOkResponse()
  @ApiBearerAuth()
  @Post("validate/handle")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(postUserValidateHandleRequestSchema))
  @AuthFirebase()
  public async validateHandle(
    @Body() dto: ValidateUserHandleDto
  ): Promise<void> {
    return this.userService.validateHandle(dto.handle);
  }

  @ApiOperation({
    summary: "Validate invite code",
    description: "Validate if the invite exists and has not been used.",
  })
  @ApiOkResponse()
  @ApiBearerAuth()
  @Post("validate/invite-code")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(postUserValidateInviteCodeRequestSchema))
  @AuthFirebase()
  public async validateInviteCode(
    @Body() dto: ValidateUserInviteCodeDto
  ): Promise<void> {
    return this.userService.validateInviteCode(dto.inviteCode);
  }

  @ApiOperation({
    summary: "Follow user",
    description: "Follow a user.",
  })
  @Post("follow")
  @ApiBearerAuth()
  @UsePipes(new ZodValidationPipe(postUserFollowRequestSchema))
  @Auth()
  public async followUser(
    @User() authUser: AuthUser,
    @Body() dto: FollowUserDto
  ): Promise<void> {
    const { userId } = authUser;
    return this.userService.followUser(userId, dto.userId);
  }

  @ApiOperation({
    summary: "Unfollow user",
    description: "Unfollow a user.",
  })
  @Delete("follow")
  @ApiBearerAuth()
  @UsePipes(new ZodValidationPipe(deleteUserFollowParamsSchema))
  @Auth()
  public async unfollowUser(
    @User() authUser: AuthUser,
    @Query() dto: UnfollowUserDto
  ): Promise<void> {
    const { userId } = authUser;
    return this.userService.unfollowUser(userId, dto.userId);
  }
}

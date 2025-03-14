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
import {
  ZodValidationBodyPipe,
  ZodValidationQueryPipe,
} from "@recnet-api/utils/pipes/zod.validation.pipe";

import {
  deleteUserFollowParamsSchema,
  getUsersParamsSchema,
  patchUserMeActivateRequestSchema,
  patchUserMeRequestSchema,
  postUserFollowRequestSchema,
  postUserMeRequestSchema,
  postUsersSubscriptionsRequestSchema,
  postUsersSubscriptionsSlackOauthRequestSchema,
  postUserValidateHandleRequestSchema,
  postUserValidateInviteCodeRequestSchema,
} from "@recnet/recnet-api-model";

import { CreateUserDto } from "./dto/create.user.dto";
import { FollowUserDto, UnfollowUserDto } from "./dto/follow.user.dto";
import { QueryUsersDto } from "./dto/query.users.dto";
import { SlackOauthDto } from "./dto/slack-oauth.user.dto";
import { UpdateUserActivateDto, UpdateUserDto } from "./dto/update.user.dto";
import {
  ValidateUserHandleDto,
  ValidateUserInviteCodeDto,
} from "./dto/validate.user.dto";
import { Subscription } from "./entities/user.subscription.entity";
import {
  GetSlackOauthInfoResponse,
  GetSubscriptionsResponse,
  GetUserMeResponse,
  GetUsersResponse,
  PostSubscriptionsResponse,
} from "./user.response";
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
  @UsePipes(new ZodValidationQueryPipe(getUsersParamsSchema))
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
  public async login(
    @FirebaseUser() firebaseUser: AuthFirebaseUser
  ): Promise<GetUserMeResponse> {
    const { provider, providerId } = firebaseUser;
    const user = await this.userService.login(provider, providerId);
    return { user };
  }

  @ApiOperation({
    summary: "Get me",
    description: "Get the current user.",
  })
  @ApiOkResponse({ type: GetUsersResponse })
  @ApiBearerAuth()
  @Get("me")
  @Auth({ allowNonActivated: true })
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
  @UsePipes(new ZodValidationBodyPipe(postUserMeRequestSchema))
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
  @UsePipes(new ZodValidationBodyPipe(patchUserMeRequestSchema))
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
    summary: "Update my activation status",
    description: "Update the current user's activation status.",
  })
  @ApiOkResponse({ type: GetUserMeResponse })
  @ApiBearerAuth()
  @Patch("/me/activate")
  @UsePipes(new ZodValidationBodyPipe(patchUserMeActivateRequestSchema))
  @Auth({ allowNonActivated: true })
  public async updateMyActivationStatus(
    @User() authUser: AuthUser,
    @Body() dto: UpdateUserActivateDto
  ): Promise<GetUserMeResponse> {
    const { userId } = authUser;
    const user = await this.userService.updateUserActivate(
      userId,
      dto.isActivated
    );
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
  @UsePipes(new ZodValidationBodyPipe(postUserValidateHandleRequestSchema))
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
  @UsePipes(new ZodValidationBodyPipe(postUserValidateInviteCodeRequestSchema))
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
  @UsePipes(new ZodValidationBodyPipe(postUserFollowRequestSchema))
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
  @UsePipes(new ZodValidationQueryPipe(deleteUserFollowParamsSchema))
  @Auth()
  public async unfollowUser(
    @User() authUser: AuthUser,
    @Query() dto: UnfollowUserDto
  ): Promise<void> {
    const { userId } = authUser;
    return this.userService.unfollowUser(userId, dto.userId);
  }

  @ApiOperation({
    summary: "Get subscriptions",
    description: "Get the current user's subscriptions.",
  })
  @Get("subscriptions")
  @ApiBearerAuth()
  @Auth()
  public async getSubscriptions(
    @User() authUser: AuthUser
  ): Promise<GetSubscriptionsResponse> {
    const { userId } = authUser;
    return this.userService.getSubscriptions(userId);
  }

  @ApiOperation({
    summary: "Create or update subscription",
    description: "Create or update the current user's subscription.",
  })
  @Post("subscriptions")
  @ApiBearerAuth()
  @UsePipes(new ZodValidationBodyPipe(postUsersSubscriptionsRequestSchema))
  @Auth()
  public async createOrUpdateSubscription(
    @User() authUser: AuthUser,
    @Body() dto: Subscription
  ): Promise<PostSubscriptionsResponse> {
    const { userId } = authUser;
    const { type, channels } = dto;
    return this.userService.createOrUpdateSubscription(userId, type, channels);
  }

  @ApiOperation({
    summary: "Get Slack OAuth info",
    description: "Get the current user's Slack OAuth info.",
  })
  @Get("subscriptions/slack/oauth")
  @ApiBearerAuth()
  @Auth()
  public async getSlackOauthInfo(
    @User() authUser: AuthUser
  ): Promise<GetSlackOauthInfoResponse> {
    const { userId } = authUser;
    return this.userService.getSlackOauthInfo(userId);
  }

  @ApiOperation({
    summary: "Slack OAuth",
    description: "Slack OAuth",
  })
  @Post("subscriptions/slack/oauth")
  @ApiBearerAuth()
  @UsePipes(
    new ZodValidationBodyPipe(postUsersSubscriptionsSlackOauthRequestSchema)
  )
  @Auth()
  public async slackOauth(
    @User() authUser: AuthUser,
    @Body() dto: SlackOauthDto
  ): Promise<GetSlackOauthInfoResponse> {
    const { userId } = authUser;
    return this.userService.installSlack(userId, dto.redirectUri, dto.code);
  }

  @ApiOperation({
    summary: "Delete Slack OAuth",
    description: "Delete Slack OAuth",
  })
  @Delete("subscriptions/slack/oauth")
  @ApiBearerAuth()
  @Auth()
  public async deleteSlackOauth(@User() authUser: AuthUser): Promise<void> {
    const { userId } = authUser;
    return this.userService.deleteSlack(userId);
  }
}

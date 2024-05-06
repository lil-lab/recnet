import {
  Controller,
  Body,
  UseFilters,
  UsePipes,
  Post,
  Get,
  Query,
} from "@nestjs/common";
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
} from "@nestjs/swagger";

import { Auth } from "@recnet-api/utils/auth/auth.decorator";
import { AuthUser } from "@recnet-api/utils/auth/auth.type";
import { User } from "@recnet-api/utils/auth/auth.user.decorator";
import { RecnetExceptionFilter } from "@recnet-api/utils/filters/recnet.exception.filter";
import { ZodValidationPipe } from "@recnet-api/utils/pipes/zod.validation.pipe";

import {
  postInviteCodesRequestSchema,
  getInviteCodesAllParamsSchema,
  getInviteCodesParamsSchema,
} from "@recnet/recnet-api-model";

import { CreateInviteCodeDto } from "./dto/create.invite-code.dto";
import {
  QueryAllInviteCodeDto,
  QueryInviteCodeDto,
} from "./dto/query.invite-code.dto";
import {
  CreateInviteCodeResponse,
  GetAllInviteCodeResponse,
  GetInviteCodeResponse,
} from "./invite-code.response";
import { InviteCodeService } from "./invite-code.service";

@ApiTags("invite-codes")
@Controller("invite-codes")
@UseFilters(RecnetExceptionFilter)
export class InviteCodeController {
  constructor(private readonly inviteCodeService: InviteCodeService) {}

  @ApiOperation({
    summary: "Generate Invite Codes",
    description: "Generate n invite codes and assign to target user.",
  })
  @ApiOkResponse({ type: CreateInviteCodeResponse })
  @ApiBearerAuth()
  @Post()
  @Auth(["ADMIN"])
  @UsePipes(new ZodValidationPipe(postInviteCodesRequestSchema))
  public async createInviteCode(
    @Body() dto: CreateInviteCodeDto
  ): Promise<CreateInviteCodeResponse> {
    const { numCodes, ownerId, upperBound } = dto;
    return this.inviteCodeService.createInviteCode(
      numCodes,
      ownerId,
      upperBound
    );
  }

  @ApiOperation({
    summary: "Get all Invite Codes",
    description: "Get all invite codes with pagination. Admin only.",
  })
  @ApiOkResponse({ type: GetAllInviteCodeResponse })
  @ApiBearerAuth()
  @Get("all")
  @Auth(["ADMIN"])
  @UsePipes(new ZodValidationPipe(getInviteCodesAllParamsSchema))
  public async getInviteCodes(
    @Query() dto: QueryAllInviteCodeDto
  ): Promise<GetAllInviteCodeResponse> {
    const { page, pageSize, ...filter } = dto;
    return this.inviteCodeService.getInviteCodes(page, pageSize, filter);
  }

  @ApiOperation({
    summary: "Get all Invite Codes under current user",
    description:
      "Get all invite codes with pagination. Aslo return unused codes count.",
  })
  @ApiOkResponse({ type: GetInviteCodeResponse })
  @ApiBearerAuth()
  @Get()
  @Auth()
  @UsePipes(new ZodValidationPipe(getInviteCodesParamsSchema))
  public async getInviteCodesByUser(
    @Query() dto: QueryInviteCodeDto,
    @User("userId") userId: AuthUser<"userId">
  ): Promise<GetInviteCodeResponse> {
    const { page, pageSize, used } = dto;
    const res = await this.inviteCodeService.getInviteCodes(page, pageSize, {
      used,
      ownerId: userId,
    });
    const unusedCodesCount = await this.inviteCodeService.countInviteCodes({
      used: false,
      ownerId: userId,
    });
    return {
      ...res,
      unusedCodesCount,
    };
  }
}

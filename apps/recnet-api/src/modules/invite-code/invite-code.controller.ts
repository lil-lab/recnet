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
import { RecnetExceptionFilter } from "@recnet-api/utils/filters/recnet.exception.filter";
import { ZodValidationPipe } from "@recnet-api/utils/pipes/zod.validation.pipe";

import {
  postInviteCodesRequestSchema,
  getInviteCodesParamsSchema,
} from "@recnet/recnet-api-model";

import { CreateInviteCodeDto } from "./dto/create.invite-code.dto";
import { QueryInviteCodeDto } from "./dto/query.invite-code.dto";
import {
  CreateInviteCodeResponse,
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
  @Auth()
  @UsePipes(new ZodValidationPipe(postInviteCodesRequestSchema))
  public async createInviteCode(
    @Body() dto: CreateInviteCodeDto
  ): Promise<CreateInviteCodeResponse> {
    const { numCodes, ownerId } = dto;
    return this.inviteCodeService.createInviteCode(numCodes, ownerId);
  }

  @ApiOperation({
    summary: "Get Invite Codes",
    description: "Get all invite codes with pagination.",
  })
  @ApiOkResponse({ type: GetInviteCodeResponse })
  @ApiBearerAuth()
  @Get()
  @Auth()
  @UsePipes(new ZodValidationPipe(getInviteCodesParamsSchema))
  public async getInviteCodes(
    @Query() dto: QueryInviteCodeDto
  ): Promise<GetInviteCodeResponse> {
    const { page, pageSize, ...filter } = dto;
    return this.inviteCodeService.getInviteCodes(page, pageSize, filter);
  }
}

import { Controller, Body, UseFilters, UsePipes, Post } from "@nestjs/common";
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
} from "@nestjs/swagger";

import { Auth } from "@recnet-api/utils/auth/auth.decorator";
import { RecnetExceptionFilter } from "@recnet-api/utils/filters/recnet.exception.filter";
import { ZodValidationPipe } from "@recnet-api/utils/pipes/zod.validation.pipe";

import { postInviteCodesRequestSchema } from "@recnet/recnet-api-model";

import { CreateInviteCodeDto } from "./dto/create.invite-code.dto";
import { CreateInviteCodeResponse } from "./invite-code.response";
import { InviteCodeService } from "./invite-code.service";

@ApiTags("invite-codes")
@Controller("invite-codes")
@UseFilters(RecnetExceptionFilter)
export class InviteCodeController {
  constructor(private readonly inviteCodeService: InviteCodeService) {}

  @ApiOperation({
    summary: "Generate Invite Code",
    description: "Generate n invite code and assign to target user.",
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
}

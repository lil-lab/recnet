import { Body, Controller, HttpStatus, Inject, Post } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";

import { AppConfig } from "@recnet-api/config/common.config";
import { RecnetError } from "@recnet-api/utils/error/recnet.error";
import { ErrorCode } from "@recnet-api/utils/error/recnet.error.const";

import { EmailService } from "./email.service";

@ApiTags("mail")
@Controller("mail")
export class EmailController {
  constructor(
    @Inject(AppConfig.KEY)
    private readonly appConfig: ConfigType<typeof AppConfig>,
    private readonly emailService: EmailService
  ) {}

  /* Development only */
  @ApiOperation({
    summary: "Send weekly digest email to the designated user.",
    description: "This endpoint is for development only.",
  })
  @ApiCreatedResponse()
  @ApiBody({
    schema: {
      properties: {
        userId: { type: "string" },
      },
      required: ["userId"],
    },
  })
  @Post("test")
  public async testSendingWeeklyDigest(
    @Body("userId") userId: string
  ): Promise<{
    success: boolean;
  }> {
    if (this.appConfig.nodeEnv === "production") {
      throw new RecnetError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        "This endpoint is only for development"
      );
    }
    return this.emailService.sendTestEmail(userId);
  }
}

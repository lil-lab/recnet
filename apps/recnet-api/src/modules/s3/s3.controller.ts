import { Controller, Get, Delete, Query } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";

import { S3Service } from "./s3.service";

@Controller("s3url")
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}
  @ApiOperation({
    summary: "Get S3 Upload URL",
    description: "Get a secure signed Url to upload profile photo to S3 bucket",
  })
  @Get()
  getS3UploadUrl(): Promise<{ url: string }> {
    return this.s3Service.getS3UploadUrl();
  }

  @ApiOperation({
    summary: "Delete S3 Object",
    description: "Delete S3 Object (profile photo)",
  })
  @Delete()
  async deleteS3Object(@Query("fileUrl") fileUrl: string): Promise<void> {
    return this.s3Service.deleteS3Object(fileUrl);
  }
}

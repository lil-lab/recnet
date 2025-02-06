import { Controller, Get } from "@nestjs/common";

import { S3Service } from "./s3.service";

@Controller("s3url")
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Get()
  getS3UploadUrl(): Promise<{ url: string }> {
    console.log("getS3UploadUrl function called");
    return this.s3Service.getS3UploadUrl();
  }
}
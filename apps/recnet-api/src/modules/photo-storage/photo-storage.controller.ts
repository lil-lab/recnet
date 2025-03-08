import { Controller, Delete, Post, Query } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";

import { PhotoStorageService } from "./photo-storage.service";

@Controller("photo-storage")
export class PhotoStorageController {
  constructor(private readonly photoStorageService: PhotoStorageService) {}
  @ApiOperation({
    summary: "Generate S3 Upload URL",
    description:
      "Generate a secure signed Url to upload profile photo to S3 bucket",
  })
  @Post("upload-url")
  generateUploadUrl(): Promise<{ url: string }> {
    return this.photoStorageService.generateS3UploadUrl();
  }

  @ApiOperation({
    summary: "Delete S3 Object",
    description: "Delete S3 Object (profile photo)",
  })
  @Delete("photo")
  async deleteS3Object(@Query("fileUrl") fileUrl: string): Promise<void> {
    return this.photoStorageService.deleteS3Object(fileUrl);
  }
}

import { S3Client } from "@aws-sdk/client-s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { HttpStatus, Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { v4 as uuidv4 } from "uuid";

import { S3Config } from "@recnet-api/config/common.config";
import { RecnetError } from "@recnet-api/utils/error/recnet.error";
import { ErrorCode } from "@recnet-api/utils/error/recnet.error.const";

@Injectable()
export class S3Service {
  private readonly s3: S3Client;

  constructor(
    @Inject(S3Config.KEY)
    private readonly s3Config: ConfigType<typeof S3Config>
  ) {
    this.s3 = new S3Client({
      region: this.s3Config.s3Region,
      credentials: {
        accessKeyId: this.s3Config.accessKeyId,
        secretAccessKey: this.s3Config.secretAccessKey,
      },
    });
  }

  async getS3UploadUrl(): Promise<{ url: string }> {
    // build time stamp as part of the image name, format: YYYY-MM-DD-HH-MM-SS
    // e.g. the current date and time is February 21, 2025, 10:30:45 AM,
    // the timestamp would be: 2025-02-21-10-30-45
    const timestamp = new Date()
      .toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
      .replace(/[/,: ]/g, "-");

    const imageName = `${timestamp}-${uuidv4()}`;

    const command = new PutObjectCommand({
      Bucket: this.s3Config.bucketName,
      Key: imageName,
    });

    try {
      const uploadURL = await getSignedUrl(this.s3, command, { expiresIn: 60 });
      return { url: uploadURL };
    } catch (error: unknown) {
      throw new RecnetError(
        ErrorCode.AWS_S3_GET_SIGNED_URL_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async deleteS3Object(fileUrl: string): Promise<void> {
    // Extract the key (filename) from the URL
    const urlParts = fileUrl.split("/");
    const key = urlParts[urlParts.length - 1];

    const command = new DeleteObjectCommand({
      Bucket: this.s3Config.bucketName,
      Key: key,
    });

    try {
      await this.s3.send(command);
    } catch (error: unknown) {
      throw new RecnetError(
        ErrorCode.AWS_S3_DELETE_OBJECT_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}

import { S3Client } from "@aws-sdk/client-s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Injectable } from "@nestjs/common";
import { Inject } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { v4 as uuidv4 } from "uuid";

import { S3Config } from "@recnet-api/config/common.config";

@Injectable()
export class S3Service {
  private readonly s3Region: string;
  private readonly s3BucketName: string;
  private readonly accessKeyId: string;
  private readonly secretAccessKey: string;
  private readonly s3: S3Client;

  constructor(
    @Inject(S3Config.KEY)
    private readonly s3Config: ConfigType<typeof S3Config>
  ) {
    this.s3Region = this.s3Config.s3Region;
    this.s3BucketName = this.s3Config.bucketName;
    this.accessKeyId = this.s3Config.accessKeyId;
    this.secretAccessKey = this.s3Config.secretAccessKey;
    this.s3 = new S3Client({
      region: this.s3Region,
      credentials: {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
      },
    });
  }

  async getS3UploadUrl(): Promise<{ url: string }> {
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
      Bucket: this.s3BucketName,
      Key: imageName,
    });

    const uploadURL = await getSignedUrl(this.s3, command, { expiresIn: 60 });
    return { url: uploadURL };
  }

  async deleteS3Object(fileUrl: string): Promise<void> {
    // Extract the key (filename) from the URL
    const urlParts = fileUrl.split("/");
    const key = urlParts[urlParts.length - 1];

    const command = new DeleteObjectCommand({
      Bucket: this.s3BucketName,
      Key: key,
    });

    try {
      await this.s3.send(command);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to delete S3 object: ${errorMessage}`);
    }
  }
}

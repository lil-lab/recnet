import { Injectable } from "@nestjs/common";
import { HttpStatus, Inject } from "@nestjs/common";
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { S3Config } from "@recnet-api/config/common.config";
import { ConfigType } from "@nestjs/config";

@Injectable()
export class S3Service {
  private readonly region: string;
  private readonly s3BucketName: string;
  private readonly accessKeyId: string;
  private readonly secretAccessKey: string;
  private readonly s3: AWS.S3;

  constructor(
    @Inject(S3Config.KEY)
    private readonly s3Config: ConfigType<typeof S3Config>,
  ) {
    this.region = this.s3Config.s3Region;
    this.s3BucketName = this.s3Config.bucketName;
    this.accessKeyId = this.s3Config.accessKeyId;
    this.secretAccessKey = this.s3Config.secretAccessKey;
    this.s3 = new AWS.S3({
      region: this.region,
      accessKeyId: this.accessKeyId,
      secretAccessKey: this.secretAccessKey,
      signatureVersion: "v4"
  });
  }

  async getS3UploadUrl(): Promise<{ url: string }> {
    const timestamp = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/[/,: ]/g, '-');
    
    const imageName = `${timestamp}-${uuidv4()}`;

    const params = {
      Bucket: this.s3BucketName,
      Key: imageName,
      Expires: 60,
    };

    const uploadURL = await this.s3.getSignedUrlPromise("putObject", params);
    return { url: uploadURL };
  }
}
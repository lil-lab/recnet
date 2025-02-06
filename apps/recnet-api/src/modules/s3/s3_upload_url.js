import dotenv from 'dotenv';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const region = "us-east-2";
const s3BucketName = process.env.AWS_BUCKET_NAME;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new AWS.S3({
    region,
    accessKeyId,
    secretAccessKey,
    signatureVersion: "v4"
});

export async function generateUploadURL() {
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

    const params = ({
        Bucket: s3BucketName,
        Key: imageName,
        Expires: 60,
    })

    const uploadURL = await s3.getSignedUrlPromise("putObject", params);
    return uploadURL;
}
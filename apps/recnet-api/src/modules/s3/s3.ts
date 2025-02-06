// import AWS from 'aws-sdk';
// import dotenv from 'dotenv';
// import { v4 as uuidv4 } from 'uuid';

// dotenv.config();

// const AWS_REGION = process.env.AWS_REGION;
// const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
// const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
// const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY

// const s3 = new AWS.S3({
//     region: AWS_REGION,
//     accessKeyId: AWS_ACCESS_KEY_ID,
//     secretAccessKey: AWS_SECRET_ACCESS_KEY,
//     signatureVersion: "v4"
// })

// const uploadToS3 = async (data: Buffer, fileName: string) => {
//     const imageName = `${uuidv4()}-${fileName}`;
//     await s3.putObject({
//         Bucket: BUCKET_NAME,
//         Key: imageName,
//         Body: data,
//         ContentType: "image/png",
//         ACL: "public-read"
//     }).promise();
//     return `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${imageName}`;
// }
import { registerAs } from "@nestjs/config";

import { parseEnv } from "./env.schema";

const parsedEnv = parseEnv(process.env);

export const AppConfig = registerAs("app", () => ({
  port: parsedEnv.PORT,
  nodeEnv: parsedEnv.NODE_ENV,
  logLevel: parsedEnv.LOG_LEVEL,
}));

export const DBConfig = registerAs("db", () => ({
  host: parsedEnv.RDS_HOSTNAME,
  port: parsedEnv.RDS_PORT,
  database: parsedEnv.RDS_DB_NAME,
  username: parsedEnv.RDS_USERNAME,
  password: parsedEnv.RDS_PASSWORD,
}));

export const PrismaConfig = registerAs("prisma", () => ({
  schema: parsedEnv.PRISMA_SCHEMA,
  migrate: parsedEnv.DB_MIGRATE,
}));

export const NodemailerConfig = registerAs("nodemailer", () => ({
  service: parsedEnv.SMTP_SERVICE,
  host: parsedEnv.SMTP_HOST,
  port: parsedEnv.SMTP_PORT,
  secure: parsedEnv.SMTP_SECURE === "true",
  user: parsedEnv.SMTP_USER,
  pass: parsedEnv.SMTP_PASS,
}));

export const SlackConfig = registerAs("slack", () => ({
  token: parsedEnv.SLACK_TOKEN, // to be deprecated
  clientId: parsedEnv.SLACK_CLIENT_ID,
  clientSecret: parsedEnv.SLACK_CLIENT_SECRET,
  tokenEncryptionKey: parsedEnv.SLACK_TOKEN_ENCRYPTION_KEY,
}));

export const S3Config = registerAs("s3", () => ({
  bucketName: parsedEnv.AWS_BUCKET_NAME,
  accessKeyId: parsedEnv.AWS_ACCESS_KEY_ID,
  secretAccessKey: parsedEnv.AWS_SECRET_ACCESS_KEY,
  s3Region: parsedEnv.AWS_REGION,
}));

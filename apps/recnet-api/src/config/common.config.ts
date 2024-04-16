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

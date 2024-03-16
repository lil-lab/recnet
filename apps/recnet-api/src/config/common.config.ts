import { registerAs } from "@nestjs/config";

import { parseEnv } from "./env.schema";

const parsedEnv = parseEnv(process.env);

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

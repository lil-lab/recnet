import { z } from "zod";

const nodeEnv = z.enum(["development", "production", "local", "test"]);
const logLevel = z.enum(["error", "warn", "debug", "verbose"]);

export const EnvSchema = z.object({
  PORT: z.coerce.number().optional().default(3000),
  NODE_ENV: nodeEnv.default("development"),
  LOG_LEVEL: logLevel.optional(),
  // db config
  RDS_HOSTNAME: z.string().optional().default("localhost"),
  RDS_PORT: z.coerce.number().optional().default(5432),
  RDS_DB_NAME: z.string(),
  RDS_USERNAME: z.string(),
  RDS_PASSWORD: z.string(),
  // prisma config
  PRISMA_SCHEMA: z.string().optional().default("prisma/schema.prisma"),
  DB_MIGRATE: z.coerce.boolean().optional().default(false),
});

export const parseEnv = (env: Record<string, string | undefined>) => {
  const parsedEnv = EnvSchema.parse(env);
  return parsedEnv;
};

import { registerAs } from "@nestjs/config";

export const DBConfig = registerAs("db", () => ({
  host: process.env.RDS_HOSTNAME || "localhost",
  port: parseInt(process.env.RDS_PORT, 10) || 5432,
  database: process.env.RDS_DB_NAME,
  username: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
}));

export const PrismaConfig = registerAs("prisma", () => ({
  schema: process.env.PRISMA_SCHEMA || "prisma/schema.prisma",
  migrate: process.env.DB_MIGRATE === "true",
}));

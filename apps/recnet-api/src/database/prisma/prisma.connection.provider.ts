import { execSync } from "child_process";

import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

const postgresConfig = {
  host: process.env.RDS_HOSTNAME,
  port: parseInt(process.env.RDS_PORT, 10),
  database: process.env.RDS_DB_NAME,
  username: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
};

@Injectable()
export class PrismaConnectionProvider
  extends PrismaClient
  implements OnModuleInit
{
  private prismaUrl: string;

  constructor() {
    const connectionUrl = `postgresql://${postgresConfig.username}:${encodeURIComponent(
      postgresConfig.password
    )}@${postgresConfig.host}:${postgresConfig.port}/${
      postgresConfig.database
    }?schema=recnet`;

    super({
      datasources: {
        db: {
          url: `${connectionUrl}&pool_timeout=60`,
        },
      },
    });

    this.prismaUrl = connectionUrl;
  }

  async onModuleInit() {
    await this.$connect();

    const prismaSchema =
      process.env.PRISMA_SCHEMA || "dist/apps/recnet-api/prisma/schema.prisma";

    if (process.env.DB_MIGRATE === "true") {
      execSync(
        `export PRISMA_DATABASE_URL=${this.prismaUrl} && pnpx prisma migrate deploy --schema=${prismaSchema}`,
        { stdio: "inherit" }
      );
    }
  }
}

export default PrismaConnectionProvider;

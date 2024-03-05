import { Injectable, OnModuleInit } from "@nestjs/common";
// import { PrismaClient } from "src/generated/prisma-client";
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
  constructor() {
    super({
      datasources: {
        db: {
          url: `postgresql://${postgresConfig.username}:${encodeURIComponent(
            postgresConfig.password
          )}@${postgresConfig.host}:${postgresConfig.port}/${
            postgresConfig.database
          }?schema=recnet&pool_timeout=60`,
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }
}

export default PrismaConnectionProvider;

import { execSync } from "child_process";

import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { PrismaClient } from "@prisma/client";
import { DBConfig, PrismaConfig } from "src/config/common.config";

@Injectable()
export class PrismaConnectionProvider
  extends PrismaClient
  implements OnModuleInit
{
  private prismaUrl: string;

  constructor(
    @Inject(DBConfig.KEY)
    private dbConfig: ConfigType<typeof DBConfig>,
    @Inject(PrismaConfig.KEY)
    private prismaConfig: ConfigType<typeof PrismaConfig>
  ) {
    const { host, port, database, username, password } = dbConfig;
    const connectionUrl = `postgresql://${username}:${encodeURIComponent(
      password
    )}@${host}:${port}/${database}?schema=recnet`;

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

    if (this.prismaConfig.migrate) {
      execSync(
        `export PRISMA_DATABASE_URL=${this.prismaUrl} && npx prisma migrate deploy --schema=${this.prismaConfig.schema}`,
        { stdio: "inherit" }
      );
    }
  }
}

export default PrismaConnectionProvider;

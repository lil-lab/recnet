import { Injectable } from "@nestjs/common";
import { CronStatus } from "@prisma/client";

import PrismaConnectionProvider from "@recnet-api/database/prisma/prisma.connection.provider";

import { WeeklyDigestCronResult } from "./weekly-digest-cron-log.repository.type";

@Injectable()
export default class WeeklyDigestCronLogRepository {
  constructor(private readonly prisma: PrismaConnectionProvider) {}

  public async createWeeklyDigestCronLog(cutoff: Date) {
    return this.prisma.weeklyDigestCronLog.create({
      data: {
        cutoff,
        startTime: new Date(),
        status: CronStatus.IN_PROGRESS,
      },
    });
  }

  public async endWeeklyDigestCron(
    id: number,
    data: {
      status: CronStatus;
      result?: WeeklyDigestCronResult;
      errorMsg?: string;
    }
  ) {
    return this.prisma.weeklyDigestCronLog.update({
      where: { id },
      data: {
        ...data,
        endTime: new Date(),
      },
    });
  }
}

-- CreateEnum
CREATE TYPE "CronStatus" AS ENUM ('SUCCESS', 'FAILURE', 'IN_PROGRESS');

-- CreateTable
CREATE TABLE "WeeklyDigestCronLog" (
    "id" SERIAL NOT NULL,
    "cutoff" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "status" "CronStatus" NOT NULL,
    "result" JSONB,
    "errorMsg" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeeklyDigestCronLog_pkey" PRIMARY KEY ("id")
);

-- CreateEnum
CREATE TYPE "Channel" AS ENUM ('EMAIL', 'SLACK');

-- CreateEnum
CREATE TYPE "SubscriptionType" AS ENUM ('WEEKLY_DIGEST');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "slackEmail" VARCHAR(128);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" SERIAL NOT NULL,
    "userId" VARCHAR(64) NOT NULL,
    "type" "SubscriptionType" NOT NULL,
    "channel" "Channel" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_type_channel_key" ON "Subscription"("userId", "type", "channel");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

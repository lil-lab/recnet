/*
  Warnings:

  - You are about to drop the column `slackEmail` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "slackEmail",
ADD COLUMN     "slackAccessToken" VARCHAR(128),
ADD COLUMN     "slackUserId" VARCHAR(64),
ADD COLUMN     "slackWorkspaceName" VARCHAR(64);

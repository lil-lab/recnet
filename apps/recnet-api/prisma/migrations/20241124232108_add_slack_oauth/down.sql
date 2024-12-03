-- AlterTable
ALTER TABLE "User" DROP COLUMN "slackAccessToken",
DROP COLUMN "slackUserId",
DROP COLUMN "slackWorkspaceName",
ADD COLUMN     "slackEmail" VARCHAR(128);


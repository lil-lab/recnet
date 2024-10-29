-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_userId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "slackEmail";

-- DropTable
DROP TABLE "Subscription";

-- DropEnum
DROP TYPE "Channel";

-- DropEnum
DROP TYPE "SubscriptionType";


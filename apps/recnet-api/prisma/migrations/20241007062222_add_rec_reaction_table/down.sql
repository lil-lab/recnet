-- DropForeignKey
ALTER TABLE "RecReaction" DROP CONSTRAINT "RecReaction_userId_fkey";

-- DropForeignKey
ALTER TABLE "RecReaction" DROP CONSTRAINT "RecReaction_recId_fkey";

-- DropTable
DROP TABLE "RecReaction";

-- DropEnum
DROP TYPE "ReactionType";


-- DropForeignKey
ALTER TABLE "FollowingRecord" DROP CONSTRAINT "FollowingRecord_userId_fkey";

-- DropForeignKey
ALTER TABLE "FollowingRecord" DROP CONSTRAINT "FollowingRecord_followerId_fkey";

-- DropForeignKey
ALTER TABLE "Recommendation" DROP CONSTRAINT "Recommendation_userId_fkey";

-- DropForeignKey
ALTER TABLE "Recommendation" DROP CONSTRAINT "Recommendation_articleId_fkey";

-- DropForeignKey
ALTER TABLE "InviteCode" DROP CONSTRAINT "InviteCode_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "InviteCode" DROP CONSTRAINT "InviteCode_usedById_fkey";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "FollowingRecord";

-- DropTable
DROP TABLE "Recommendation";

-- DropTable
DROP TABLE "Article";

-- DropTable
DROP TABLE "InviteCode";

-- DropEnum
DROP TYPE "Provider";

-- DropEnum
DROP TYPE "Role";


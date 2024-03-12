-- DropForeignKey
ALTER TABLE "FollowingRecord" DROP CONSTRAINT "FollowingRecord_followingId_fkey";

-- DropForeignKey
ALTER TABLE "FollowingRecord" DROP CONSTRAINT "FollowingRecord_followedById_fkey";

-- AlterTable
ALTER TABLE "FollowingRecord" DROP CONSTRAINT "FollowingRecord_pkey",
DROP COLUMN "followedById",
DROP COLUMN "followingId",
ADD COLUMN     "followerId" VARCHAR(64) NOT NULL,
ADD COLUMN     "userId" VARCHAR(64) NOT NULL,
ADD CONSTRAINT "FollowingRecord_pkey" PRIMARY KEY ("userId", "followerId");

-- AddForeignKey
ALTER TABLE "FollowingRecord" ADD CONSTRAINT "FollowingRecord_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowingRecord" ADD CONSTRAINT "FollowingRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


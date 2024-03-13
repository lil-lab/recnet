/*
  Warnings:

  - The primary key for the `FollowingRecord` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `followerId` on the `FollowingRecord` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `FollowingRecord` table. All the data in the column will be lost.
  - Added the required column `followedById` to the `FollowingRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `followingId` to the `FollowingRecord` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FollowingRecord" DROP CONSTRAINT "FollowingRecord_followerId_fkey";

-- DropForeignKey
ALTER TABLE "FollowingRecord" DROP CONSTRAINT "FollowingRecord_userId_fkey";

-- AlterTable
ALTER TABLE "FollowingRecord" DROP CONSTRAINT "FollowingRecord_pkey",
DROP COLUMN "followerId",
DROP COLUMN "userId",
ADD COLUMN     "followedById" VARCHAR(64) NOT NULL,
ADD COLUMN     "followingId" VARCHAR(64) NOT NULL,
ADD CONSTRAINT "FollowingRecord_pkey" PRIMARY KEY ("followingId", "followedById");

-- AddForeignKey
ALTER TABLE "FollowingRecord" ADD CONSTRAINT "FollowingRecord_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowingRecord" ADD CONSTRAINT "FollowingRecord_followedById_fkey" FOREIGN KEY ("followedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

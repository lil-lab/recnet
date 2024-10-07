-- CreateEnum
CREATE TYPE "ReactionType" AS ENUM ('THUMBS_UP', 'THINKING', 'SURPRISED', 'CRYING', 'STARRY_EYES', 'MINDBLOWN', 'EYES', 'ROCKET', 'HEART', 'PRAY', 'PARTY');

-- CreateTable
CREATE TABLE "RecReaction" (
    "id" SERIAL NOT NULL,
    "userId" VARCHAR(64) NOT NULL,
    "recId" VARCHAR(64) NOT NULL,
    "reaction" "ReactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecReaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RecReaction_userId_recId_reaction_key" ON "RecReaction"("userId", "recId", "reaction");

-- AddForeignKey
ALTER TABLE "RecReaction" ADD CONSTRAINT "RecReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecReaction" ADD CONSTRAINT "RecReaction_recId_fkey" FOREIGN KEY ("recId") REFERENCES "Recommendation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

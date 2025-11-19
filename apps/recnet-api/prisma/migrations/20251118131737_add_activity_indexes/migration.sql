-- CreateIndex
CREATE INDEX "Recommendation_userId_cutoff_idx" ON "Recommendation"("userId", "cutoff" DESC);

-- CreateIndex
CREATE INDEX "RecReaction_userId_createdAt_idx" ON "RecReaction"("userId", "createdAt" DESC);


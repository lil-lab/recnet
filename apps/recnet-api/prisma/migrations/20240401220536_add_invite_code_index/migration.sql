/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `InviteCode` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "InviteCode_code_key" ON "InviteCode"("code");

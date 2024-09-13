-- CreateTable
CREATE TABLE "DigitalLibrary" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "regex" TEXT[],
    "isVerified" BOOLEAN NOT NULL,
    "rank" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DigitalLibrary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DigitalLibrary_name_key" ON "DigitalLibrary"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DigitalLibrary_rank_key" ON "DigitalLibrary"("rank");

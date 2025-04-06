-- CreateTable
CREATE TABLE "DraftStatus" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "round" INTEGER NOT NULL DEFAULT 1,
    "turn" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DraftStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DraftStatus_tournamentId_key" ON "DraftStatus"("tournamentId");

-- AddForeignKey
ALTER TABLE "DraftStatus" ADD CONSTRAINT "DraftStatus_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

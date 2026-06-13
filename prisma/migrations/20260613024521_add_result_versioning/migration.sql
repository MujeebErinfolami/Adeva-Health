-- AlterTable
ALTER TABLE "Result" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "ResultVersion" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "value" TEXT,
    "flag" TEXT,
    "amendedBy" TEXT NOT NULL,
    "amendedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT NOT NULL,

    CONSTRAINT "ResultVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ResultVersion_tenantId_idx" ON "ResultVersion"("tenantId");

-- CreateIndex
CREATE INDEX "ResultVersion_resultId_idx" ON "ResultVersion"("resultId");

-- AddForeignKey
ALTER TABLE "ResultVersion" ADD CONSTRAINT "ResultVersion_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "Result"("id") ON DELETE CASCADE ON UPDATE CASCADE;

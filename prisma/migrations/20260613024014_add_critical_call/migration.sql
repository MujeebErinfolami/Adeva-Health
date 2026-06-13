-- CreateTable
CREATE TABLE "CriticalCall" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "notifiedName" TEXT NOT NULL,
    "notifiedBy" TEXT NOT NULL,
    "calledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readback" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,

    CONSTRAINT "CriticalCall_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CriticalCall_tenantId_idx" ON "CriticalCall"("tenantId");

-- CreateIndex
CREATE INDEX "CriticalCall_resultId_idx" ON "CriticalCall"("resultId");

-- AddForeignKey
ALTER TABLE "CriticalCall" ADD CONSTRAINT "CriticalCall_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "Result"("id") ON DELETE CASCADE ON UPDATE CASCADE;

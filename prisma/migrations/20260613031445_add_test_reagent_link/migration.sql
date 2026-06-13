-- CreateTable
CREATE TABLE "TestReagent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "qtyPerTest" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TestReagent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TestReagent_tenantId_idx" ON "TestReagent"("tenantId");

-- CreateIndex
CREATE INDEX "TestReagent_testId_idx" ON "TestReagent"("testId");

-- CreateIndex
CREATE INDEX "TestReagent_inventoryItemId_idx" ON "TestReagent"("inventoryItemId");

-- AddForeignKey
ALTER TABLE "TestReagent" ADD CONSTRAINT "TestReagent_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestReagent" ADD CONSTRAINT "TestReagent_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

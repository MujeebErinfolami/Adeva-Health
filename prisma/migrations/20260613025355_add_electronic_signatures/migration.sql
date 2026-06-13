-- AlterTable
ALTER TABLE "Result" ADD COLUMN     "releasedById" TEXT,
ADD COLUMN     "signedMeaning" TEXT;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_validatedById_fkey" FOREIGN KEY ("validatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_releasedById_fkey" FOREIGN KEY ("releasedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

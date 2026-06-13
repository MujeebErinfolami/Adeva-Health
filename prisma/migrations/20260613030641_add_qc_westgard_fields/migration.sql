-- AlterTable
ALTER TABLE "QCRun" ADD COLUMN     "correctiveAction" TEXT,
ADD COLUMN     "mean" DOUBLE PRECISION,
ADD COLUMN     "resolvedAt" TIMESTAMP(3),
ADD COLUMN     "resolvedById" TEXT,
ADD COLUMN     "rulesViolated" TEXT[],
ADD COLUMN     "sd" DOUBLE PRECISION,
ADD COLUMN     "zScore" DOUBLE PRECISION;

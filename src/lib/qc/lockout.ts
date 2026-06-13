import { prisma } from "@/lib/db";

export async function isAssayLocked(
  tenantId: string,
  instrumentId: string,
  testCode: string
): Promise<boolean> {
  const latest = await prisma.qCRun.findFirst({
    where: { tenantId, instrumentId, testCode },
    orderBy: { runAt: "desc" },
    select: { pass: true, resolvedAt: true },
  });

  if (!latest) return false;
  return latest.pass === false && latest.resolvedAt === null;
}

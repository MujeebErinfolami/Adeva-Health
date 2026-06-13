import { prisma } from "@/lib/db";
import { computeRowHash } from "@/lib/audit/hashChain";

interface RecordAuditParams {
  tenantId?: string;
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  before?: unknown;
  after?: unknown;
}

export async function recordAudit({
  tenantId,
  userId,
  action,
  entity,
  entityId,
  before,
  after,
}: RecordAuditParams): Promise<void> {
  const meta =
    before !== undefined || after !== undefined
      ? { before: before ?? null, after: after ?? null }
      : undefined;

  const latest = await prisma.auditLog.findFirst({
    orderBy: { createdAt: "desc" },
    select: { hash: true },
  });
  const prevHash = latest?.hash ?? null;

  const rowData = { tenantId, actorId: userId, action, entity, entityId, meta };
  const hash = computeRowHash(prevHash, rowData);

  await prisma.auditLog.create({
    data: { ...rowData, prevHash, hash },
  });
}

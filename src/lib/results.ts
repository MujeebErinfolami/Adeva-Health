import { prisma } from "./db";
import { assertTenant } from "./tenant";

// Roles permitted to release results. A technologist can enter and validate,
// but releasing (making a result official and reportable) is restricted.
const RELEASE_ROLES = ["LAB_ADMIN", "PATHOLOGIST", "REVIEWER"];

export function canRelease(role: string | null | undefined): boolean {
  return !!role && RELEASE_ROLES.includes(role);
}

// Orders for the reports index, newest first.
export async function listOrdersForReports(tenantId: string) {
  return prisma.order.findMany({
    where: { tenantId: assertTenant(tenantId) },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      patient: true,
      items: { include: { test: true, result: true } },
    },
  });
}

// Everything needed to render one order's report.
export async function getOrderReport(tenantId: string, orderId: string) {
  const id = assertTenant(tenantId);
  return prisma.order.findFirst({
    where: { id: orderId, tenantId: id },
    include: {
      patient: true,
      provider: true,
      site: true,
      tenant: true,
      items: { include: { test: true, result: true } },
    },
  });
}

// Release every validated result on an order, mark the order complete, and
// write an audit entry. Caller must check canRelease() first.
export async function releaseOrderResults(
  tenantId: string,
  orderId: string,
  userId: string
) {
  const id = assertTenant(tenantId);
  const order = await prisma.order.findFirst({
    where: { id: orderId, tenantId: id },
    include: { items: { include: { result: true } } },
  });
  if (!order) throw new Error("Order not found");

  const releasable = order.items
    .map((i) => i.result)
    .filter(
      (r): r is NonNullable<typeof r> => !!r && r.status === "VALIDATED"
    );

  if (releasable.length === 0) return { released: 0 };

  await prisma.$transaction([
    ...releasable.map((r) =>
      prisma.result.update({
        where: { id: r.id },
        data: { status: "RELEASED", releasedAt: new Date() },
      })
    ),
    prisma.order.update({
      where: { id: order.id },
      data: { status: "COMPLETED" },
    }),
    prisma.auditLog.create({
      data: {
        tenantId: id,
        actorId: userId,
        action: "results.released",
        entity: "Order",
        entityId: order.id,
        meta: { count: releasable.length },
        prevHash: null,
        hash: "legacy",
      },
    }),
  ]);

  return { released: releasable.length };
}

import { prisma } from "./db";
import type { Prisma } from "@prisma/client";
import { assertTenant } from "./tenant";

export async function listOrders(tenantId: string) {
  return prisma.order.findMany({
    where: { tenantId: assertTenant(tenantId) },
    orderBy: { createdAt: "desc" },
    include: {
      patient: true,
      provider: true,
      site: true,
      items: { include: { test: true, result: true } },
      specimens: { select: { id: true, barcode: true, status: true } },
    },
  });
}

export async function getOrderFormOptions(tenantId: string) {
  const id = assertTenant(tenantId);
  const [patients, tests, providers, sites] = await Promise.all([
    prisma.patient.findMany({ where: { tenantId: id }, orderBy: { lastName: "asc" } }),
    prisma.test.findMany({ where: { tenantId: id }, orderBy: { code: "asc" } }),
    prisma.provider.findMany({ where: { tenantId: id }, orderBy: { name: "asc" } }),
    prisma.site.findMany({ where: { tenantId: id }, orderBy: { type: "asc" } }),
  ]);
  return { patients, tests, providers, sites };
}

export async function createOrder(
  tenantId: string,
  input: { patientId: string; testIds: string[]; siteId?: string; providerId?: string }
) {
  const id = assertTenant(tenantId);
  if (!input.patientId) throw new Error("Pick a patient");
  if (!input.testIds?.length) throw new Error("Select at least one test");

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    return tx.order.create({
      data: {
        tenantId: id,
        patientId: input.patientId,
        providerId: input.providerId || null,
        siteId: input.siteId || null,
        status: "CREATED",
        items: {
          create: input.testIds.map((testId) => ({ tenantId: id, testId })),
        },
      },
    });
  });
}

export async function cancelOrder(tenantId: string, orderId: string) {
  const id = assertTenant(tenantId);
  const order = await prisma.order.findFirst({
    where: { id: orderId, tenantId: id },
    select: { status: true },
  });
  if (!order) throw new Error("Order not found");
  if (order.status === "COMPLETED") throw new Error("Cannot cancel a completed order");
  if (order.status === "CANCELLED") throw new Error("Order is already cancelled");

  return prisma.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED" },
  });
}

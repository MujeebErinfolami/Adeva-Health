import { prisma } from "./db";
import { assertTenant } from "./tenant";

// Lightweight billing: charges are derived from each test's price. No payment
// tracking yet (that needs an Invoice/Payment model and a migration); this is a
// read-only charges view so you can see what each order is worth.
export async function listOrderCharges(tenantId: string) {
  const orders = await prisma.order.findMany({
    where: { tenantId: assertTenant(tenantId) },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      patient: true,
      items: { include: { test: true } },
    },
  });

  return orders.map((o) => {
    const lines = o.items.map((i) => ({
      code: i.test.code,
      name: i.test.name,
      price: i.test.price ?? 0,
    }));
    const total = lines.reduce((sum, l) => sum + l.price, 0);
    return {
      id: o.id,
      patient: o.patient,
      createdAt: o.createdAt,
      status: o.status,
      lines,
      total,
    };
  });
}

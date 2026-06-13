import { prisma } from "@/lib/db";

export async function decrementForTest(
  tenantId: string,
  testId: string
): Promise<void> {
  const reagents = await prisma.testReagent.findMany({
    where: { tenantId, testId },
    include: { inventoryItem: true },
  });

  const now = new Date();

  for (const reagent of reagents) {
    const item = reagent.inventoryItem;
    if (item.expiresAt !== null && item.expiresAt < now) {
      throw new Error(
        `Inventory item "${item.name}" (${item.id}) is expired and cannot be used.`
      );
    }
    if (item.recalled) {
      throw new Error(
        `Inventory item "${item.name}" (${item.id}) has been recalled and cannot be used.`
      );
    }
  }

  await prisma.$transaction(
    reagents.map((reagent) =>
      prisma.inventoryItem.update({
        where: { id: reagent.inventoryItemId },
        data: { quantity: { decrement: reagent.qtyPerTest } },
      })
    )
  );
}

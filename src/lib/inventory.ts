import { prisma } from "./db";
import { assertTenant } from "./tenant";

export async function listInventory(tenantId: string) {
  return prisma.inventoryItem.findMany({
    where: { tenantId: assertTenant(tenantId) },
    orderBy: [{ expiresAt: "asc" }, { name: "asc" }],
  });
}

export async function addInventoryItem(
  tenantId: string,
  input: {
    name: string;
    lotNumber?: string;
    quantity?: string;
    expiresAt?: string;
  }
) {
  const id = assertTenant(tenantId);
  if (!input.name.trim()) throw new Error("Enter an item name");

  const qty = input.quantity ? Number.parseInt(input.quantity, 10) : 0;

  return prisma.inventoryItem.create({
    data: {
      tenantId: id,
      name: input.name.trim(),
      lotNumber: input.lotNumber?.trim() || null,
      quantity: Number.isFinite(qty) ? qty : 0,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
    },
  });
}

// Increment or decrement stock. Quantity never goes below zero.
export async function adjustQuantity(
  tenantId: string,
  itemId: string,
  delta: number
) {
  const id = assertTenant(tenantId);
  const item = await prisma.inventoryItem.findFirst({
    where: { id: itemId, tenantId: id },
  });
  if (!item) throw new Error("Item not found");

  return prisma.inventoryItem.update({
    where: { id: item.id },
    data: { quantity: Math.max(0, item.quantity + delta) },
  });
}

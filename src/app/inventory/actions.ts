"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { currentTenantId } from "@/lib/tenant";
import { addInventoryItem, adjustQuantity } from "@/lib/inventory";

export async function addInventoryAction(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Not signed in");

  const tenantId = await currentTenantId();
  await addInventoryItem(tenantId, {
    name: String(formData.get("name") ?? ""),
    lotNumber: String(formData.get("lotNumber") ?? "") || undefined,
    quantity: String(formData.get("quantity") ?? "") || undefined,
    expiresAt: String(formData.get("expiresAt") ?? "") || undefined,
  });

  revalidatePath("/inventory");
}

export async function adjustInventoryAction(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Not signed in");

  const tenantId = await currentTenantId();
  const itemId = String(formData.get("itemId") ?? "");
  const delta = Number.parseInt(String(formData.get("delta") ?? "0"), 10) || 0;
  await adjustQuantity(tenantId, itemId, delta);

  revalidatePath("/inventory");
}

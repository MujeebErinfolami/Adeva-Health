"use server";

import { revalidatePath } from "next/cache";
import { createOrder, cancelOrder } from "@/lib/orders";
import { currentTenantId } from "@/lib/tenant";

export async function createOrderAction(formData: FormData) {
  const tenantId = await currentTenantId();
  const testIds = formData.getAll("testIds").map(String).filter(Boolean);
  await createOrder(tenantId, {
    patientId: String(formData.get("patientId") ?? ""),
    testIds,
    siteId: String(formData.get("siteId") ?? "") || undefined,
    providerId: String(formData.get("providerId") ?? "") || undefined,
  });
  revalidatePath("/orders");
}

export async function cancelOrderAction(formData: FormData) {
  const tenantId = await currentTenantId();
  const orderId = String(formData.get("orderId") ?? "");
  await cancelOrder(tenantId, orderId);
  revalidatePath("/orders");
}

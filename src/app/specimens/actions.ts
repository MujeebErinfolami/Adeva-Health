"use server";

import { revalidatePath } from "next/cache";
import {
  collectSpecimen,
  advanceSpecimen,
  enterResult,
} from "@/lib/specimens";
import { currentTenantId } from "@/lib/tenant";

// Tenant is resolved from the signed-in user's session (see src/lib/tenant.ts).
// Orders are created on the Orders page; here we collect specimens against them.

export async function collectSpecimenAction(formData: FormData) {
  const tenantId = await currentTenantId();
  const orderId = String(formData.get("orderId") ?? "");
  await collectSpecimen(tenantId, orderId);
  revalidatePath("/specimens");
}

export async function advanceSpecimenAction(formData: FormData) {
  const tenantId = await currentTenantId();
  const specimenId = String(formData.get("specimenId") ?? "");
  await advanceSpecimen(tenantId, specimenId);
  revalidatePath("/specimens");
}

export async function enterResultAction(formData: FormData) {
  const tenantId = await currentTenantId();
  const orderItemId = String(formData.get("orderItemId") ?? "");
  const value = String(formData.get("value") ?? "");
  await enterResult(tenantId, orderItemId, value);
  revalidatePath("/specimens");
}

"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { currentTenantId } from "@/lib/tenant";
import { recordQCRun } from "@/lib/qc";

export async function recordQCAction(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Not signed in");

  const tenantId = await currentTenantId();
  await recordQCRun(tenantId, {
    instrumentId: String(formData.get("instrumentId") ?? ""),
    testCode: String(formData.get("testCode") ?? ""),
    level: String(formData.get("level") ?? ""),
    expected: String(formData.get("expected") ?? "") || undefined,
    observed: String(formData.get("observed") ?? "") || undefined,
  });

  revalidatePath("/qc");
}

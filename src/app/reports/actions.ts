"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { currentTenantId } from "@/lib/tenant";
import { releaseOrderResults, canRelease } from "@/lib/results";

export async function releaseResultsAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");
  if (!canRelease(session.user.role)) {
    throw new Error("Your role cannot release results");
  }
  const tenantId = await currentTenantId();
  const orderId = String(formData.get("orderId") ?? "");
  await releaseOrderResults(tenantId, orderId, session.user.id);
  revalidatePath(`/reports/${orderId}`);
}

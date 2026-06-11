"use server";

import { revalidatePath } from "next/cache";
import { createPatient, deletePatient } from "@/lib/patients";
import { currentTenantId } from "@/lib/tenant";

export async function createPatientAction(formData: FormData) {
  const tenantId = await currentTenantId();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  if (!firstName || !lastName) throw new Error("First and last name are required.");
  await createPatient(tenantId, {
    firstName,
    lastName,
    dob: String(formData.get("dob") ?? "") || undefined,
    sex: String(formData.get("sex") ?? "") || undefined,
    phone: String(formData.get("phone") ?? "") || undefined,
    email: String(formData.get("email") ?? "") || undefined,
  });
  revalidatePath("/patients");
}

export async function deletePatientAction(formData: FormData) {
  const tenantId = await currentTenantId();
  const patientId = String(formData.get("patientId") ?? "");
  await deletePatient(tenantId, patientId);
  revalidatePath("/patients");
}

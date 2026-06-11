import { prisma } from "./db";
import { auth } from "@/auth";

// ============================================================
// TENANT ISOLATION — the most important file in the codebase.
//
// Rule: no tenant-scoped query runs without a tenantId in its where clause.
// Enforce it HERE, in one place, instead of remembering it at every call site.
// A single missed filter = one lab seeing another lab's patients = a breach.
// ============================================================

// Resolve the current tenant from the signed-in user's session.
// Throws if there is no session, which the page guards against by redirecting
// to /login before calling tenant-scoped code.
export async function currentTenantId(): Promise<string> {
  const session = await auth();
  return assertTenant(session?.user?.tenantId);
}

// Guard: refuse any tenant-scoped access that lacks a tenantId.
export function assertTenant(tenantId?: string | null): string {
  if (!tenantId) throw new Error("Missing tenantId: tenant-scoped access denied.");
  return tenantId;
}

// Example of the ONLY safe read pattern: tenantId always in the where clause.
export async function listPatients(tenantId: string) {
  return prisma.patient.findMany({
    where: { tenantId: assertTenant(tenantId) },
    orderBy: { createdAt: "desc" },
  });
}

// Example scoped write: tenantId is set explicitly, never inferred.
export async function createPatient(
  tenantId: string,
  data: { mrn: string; firstName: string; lastName: string }
) {
  return prisma.patient.create({
    data: { ...data, tenantId: assertTenant(tenantId) },
  });
}

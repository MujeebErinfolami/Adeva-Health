import { prisma } from "./db";
import { assertTenant } from "./tenant";

export async function listPatients(tenantId: string) {
  return prisma.patient.findMany({
    where: { tenantId: assertTenant(tenantId) },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });
}

function generateMrn(): string {
  return `ADV-${Date.now().toString(36).toUpperCase()}`;
}

export async function createPatient(
  tenantId: string,
  data: {
    firstName: string;
    lastName: string;
    dob?: string;
    sex?: string;
    phone?: string;
    email?: string;
  }
) {
  return prisma.patient.create({
    data: {
      tenantId: assertTenant(tenantId),
      mrn: generateMrn(),
      firstName: data.firstName,
      lastName: data.lastName,
      dob: data.dob ? new Date(data.dob) : undefined,
      sex: data.sex || undefined,
      phone: data.phone || undefined,
      email: data.email || undefined,
    },
  });
}

export async function deletePatient(tenantId: string, patientId: string) {
  return prisma.patient.delete({
    where: { id: patientId, tenantId: assertTenant(tenantId) },
  });
}

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Seed a realistic founding-lab world for Adeva Health.
// Idempotent: deleting the tenant cascades to all its data, so re-running
// gives you a clean, identical starting point every time.
async function main() {
  const slug = "adeva-founding";

  const hashedPassword = await bcrypt.hash("adeva-dev", 12);

  // Clean slate — delete OrderItems first because their testId FK is RESTRICT
  // (no onDelete Cascade on the Test relation), so the tenant cascade would fail.
  const existing = await prisma.tenant.findFirst({ where: { slug } });
  if (existing) {
    await prisma.orderItem.deleteMany({ where: { tenantId: existing.id } });
  }
  await prisma.tenant.deleteMany({ where: { slug } });

  // The founding lab (tenant)
  const tenant = await prisma.tenant.create({
    data: {
      name: "Adeva Founding Lab",
      slug,
      status: "ACTIVE",
      legalName: "Adeva Founding Diagnostics Ltd",
      address: "12 Herbert Macaulay Way, Yaba, Lagos",
      mlscnNumber: "MLSCN/LAG/0000",
      labDirector: "Dr. [Lab Director Name]",
      lease: {
        create: {
          plan: "FOUNDING",
          status: "ACTIVE",
          monthlyPrice: 0, // co-build period: free
        },
      },
    },
  });

  // Sites: one central hub, one collection spoke
  const hub = await prisma.site.create({
    data: { tenantId: tenant.id, name: "Yaba Hub", type: "HUB" },
  });
  const spoke = await prisma.site.create({
    data: { tenantId: tenant.id, name: "Ikeja Spoke", type: "SPOKE" },
  });

  // Staff
  await prisma.user.createMany({
    data: [
      { tenantId: tenant.id, email: "admin@adeva.test",     name: "Lab Admin",       role: "LAB_ADMIN",    siteId: hub.id,   password: hashedPassword },
      { tenantId: tenant.id, email: "accession@adeva.test", name: "Front Desk",      role: "ACCESSIONER",  siteId: spoke.id, password: hashedPassword },
      { tenantId: tenant.id, email: "tech@adeva.test",      name: "Bench Scientist", role: "TECHNOLOGIST", siteId: hub.id,   password: hashedPassword },
    ],
  });

  // A referring clinic (outreach)
  await prisma.provider.create({
    data: { tenantId: tenant.id, name: "Dr. Adeyemi", clinic: "Surulere Family Clinic", phone: "+2348000000000" },
  });

  // A sample patient
  await prisma.patient.create({
    data: {
      tenantId: tenant.id,
      mrn: "ADV-0001",
      firstName: "Chidi",
      lastName: "Okonkwo",
      dob: new Date("1990-04-12"),
      sex: "M",
      phone: "+2348111111111",
    },
  });

  // A small test catalogue with reference and critical ranges
  await prisma.test.createMany({
    data: [
      { tenantId: tenant.id, code: "FBS", name: "Fasting Blood Sugar", unit: "mg/dL", refLow: 70, refHigh: 100, criticalLow: 40, criticalHigh: 400, price: 3500 },
      { tenantId: tenant.id, code: "HB", name: "Haemoglobin", unit: "g/dL", refLow: 12, refHigh: 17, criticalLow: 7, criticalHigh: 20, price: 3000 },
      { tenantId: tenant.id, code: "CREA", name: "Creatinine", unit: "mg/dL", refLow: 0.6, refHigh: 1.3, criticalHigh: 7, price: 4000 },
      { tenantId: tenant.id, code: "K", name: "Potassium", unit: "mmol/L", refLow: 3.5, refHigh: 5.1, criticalLow: 2.5, criticalHigh: 6.5, price: 4000 },
    ],
  });

  // An analyser at the hub
  await prisma.instrument.create({
    data: { tenantId: tenant.id, siteId: hub.id, make: "Mindray", model: "BS-240", serial: "BS240-0001", connection: "NETWORK" },
  });

  const counts = {
    tenant: tenant.name,
    sites: await prisma.site.count({ where: { tenantId: tenant.id } }),
    users: await prisma.user.count({ where: { tenantId: tenant.id } }),
    patients: await prisma.patient.count({ where: { tenantId: tenant.id } }),
    tests: await prisma.test.count({ where: { tenantId: tenant.id } }),
    instruments: await prisma.instrument.count({ where: { tenantId: tenant.id } }),
  };
  console.log("Seeded:", counts);
  console.log("Tenant id:", tenant.id, "(use this as tenantId while building)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

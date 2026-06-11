import { prisma } from "./db";
import { assertTenant } from "./tenant";

export async function listInstruments(tenantId: string) {
  return prisma.instrument.findMany({
    where: { tenantId: assertTenant(tenantId) },
    orderBy: { make: "asc" },
  });
}

export async function listQCRuns(tenantId: string) {
  return prisma.qCRun.findMany({
    where: { tenantId: assertTenant(tenantId) },
    orderBy: { runAt: "desc" },
    take: 50,
    include: { instrument: true },
  });
}

// Naive acceptance rule for v1: a run passes if the observed value is within
// 10% of the expected target. Real labs use Levey-Jennings charts and Westgard
// rules against a control's mean and standard deviation. That is a deliberate
// later enhancement; this keeps the workflow honest without faking the stats.
export function evaluateQC(
  expected: number | null,
  observed: number | null
): boolean {
  if (expected == null || observed == null) return true;
  if (expected === 0) return observed === 0;
  return Math.abs(observed - expected) <= Math.abs(expected) * 0.1;
}

export async function recordQCRun(
  tenantId: string,
  input: {
    instrumentId: string;
    testCode: string;
    level: string;
    expected?: string;
    observed?: string;
  }
) {
  const id = assertTenant(tenantId);
  if (!input.instrumentId) throw new Error("Pick an instrument");
  if (!input.testCode.trim()) throw new Error("Enter a test code");
  if (!input.level.trim()) throw new Error("Enter a control level");

  // Confirm the instrument belongs to this tenant before writing.
  const instrument = await prisma.instrument.findFirst({
    where: { id: input.instrumentId, tenantId: id },
  });
  if (!instrument) throw new Error("Instrument not found");

  const expected = input.expected ? Number.parseFloat(input.expected) : null;
  const observed = input.observed ? Number.parseFloat(input.observed) : null;
  const pass = evaluateQC(expected, observed);

  return prisma.qCRun.create({
    data: {
      tenantId: id,
      instrumentId: input.instrumentId,
      testCode: input.testCode.trim().toUpperCase(),
      level: input.level.trim(),
      expected: expected ?? null,
      observed: observed ?? null,
      pass,
    },
  });
}

import { prisma } from "./db";
import type { Prisma } from "@prisma/client";
import { assertTenant } from "./tenant";
import { isAssayLocked } from "@/lib/qc/lockout";
import { computeDeltaFlag } from "@/lib/results/deltaCheck";
import { shouldAutoVerify } from "@/lib/results/autoVerify";
import { decrementForTest } from "@/lib/inventory/consume";
import { recordAudit } from "@/lib/audit/write";

// The ordered specimen journey. Advancing always moves to the next stage.
// REJECTED is an off-path terminal status handled separately (not in this flow).
export const SPECIMEN_FLOW = [
  "COLLECTED",
  "IN_TRANSIT",
  "RECEIVED",
  "IN_PROGRESS",
  "RESULTED",
] as const;

export type SpecimenStage = (typeof SPECIMEN_FLOW)[number];

function nextStage(current: string): SpecimenStage | null {
  const i = SPECIMEN_FLOW.indexOf(current as SpecimenStage);
  if (i < 0 || i >= SPECIMEN_FLOW.length - 1) return null;
  return SPECIMEN_FLOW[i + 1];
}

function makeBarcode(): string {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SPC-${t}-${r}`;
}

export async function listSpecimens(tenantId: string) {
  return prisma.specimen.findMany({
    where: { tenantId: assertTenant(tenantId) },
    orderBy: { collectedAt: "desc" },
    include: {
      order: { include: { patient: true, items: { include: { test: true, result: true } } } },
      currentSite: true,
      events: { orderBy: { createdAt: "asc" } },
    },
  });
}

// Orders that have been placed but not yet collected. These are what the
// Specimens page collects against, so order creation stays on the Orders page.
export async function listCollectableOrders(tenantId: string) {
  return prisma.order.findMany({
    where: { tenantId: assertTenant(tenantId), status: "CREATED" },
    orderBy: { createdAt: "desc" },
    include: {
      patient: true,
      site: true,
      items: { include: { test: true } },
    },
  });
}

// Collect a specimen for an order that was placed on the Orders page.
// Generates the barcode, opens the chain of custody, and advances the order
// from CREATED to COLLECTED. The order already carries patient, site, and tests.
export async function collectSpecimen(tenantId: string, orderId: string) {
  const id = assertTenant(tenantId);
  const order = await prisma.order.findFirst({
    where: { id: orderId, tenantId: id },
  });
  if (!order) throw new Error("Order not found");
  if (order.status === "CANCELLED") throw new Error("Cannot collect for a cancelled order");
  if (order.status !== "CREATED") throw new Error("This order has already been collected");

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const specimen = await tx.specimen.create({
      data: {
        tenantId: id,
        orderId: order.id,
        barcode: makeBarcode(),
        type: "Blood",
        status: "COLLECTED",
        currentSiteId: order.siteId,
        events: {
          create: {
            tenantId: id,
            status: "COLLECTED",
            toSiteId: order.siteId,
            note: "Specimen collected",
          },
        },
      },
    });

    await tx.order.update({
      where: { id: order.id },
      data: { status: "COLLECTED" },
    });

    return specimen;
  });
}

// Compute the result flag by comparing a numeric value against the test's
// reference and critical ranges. Critical takes priority over high/low.
export function computeFlag(
  value: number,
  test: { refLow: number | null; refHigh: number | null; criticalLow: number | null; criticalHigh: number | null }
): "NORMAL" | "LOW" | "HIGH" | "CRITICAL_LOW" | "CRITICAL_HIGH" {
  if (test.criticalLow != null && value <= test.criticalLow) return "CRITICAL_LOW";
  if (test.criticalHigh != null && value >= test.criticalHigh) return "CRITICAL_HIGH";
  if (test.refLow != null && value < test.refLow) return "LOW";
  if (test.refHigh != null && value > test.refHigh) return "HIGH";
  return "NORMAL";
}

// Enter or update a result for one order item. Flags it automatically and
// marks it validated. orderItemId is unique on Result, so we upsert.
export async function enterResult(tenantId: string, orderItemId: string, rawValue: string) {
  const id = assertTenant(tenantId);
  const item = await prisma.orderItem.findFirst({
    where: { id: orderItemId, tenantId: id },
    include: { test: true },
  });
  if (!item) throw new Error("Order item not found");

  const locked = await isAssayLocked(id, "", item.test.code);
  if (locked) throw new Error("Results are locked for this assay due to a failed QC run.");

  const num = Number.parseFloat(rawValue);
  const flag = Number.isNaN(num) ? "NORMAL" : computeFlag(num, item.test);

  const prior = await prisma.result.findFirst({
    where: { orderItemId, status: { in: ["VALIDATED", "RELEASED"] } },
    orderBy: { createdAt: "desc" },
  });
  const priorNum = prior?.value != null ? Number.parseFloat(prior.value) : NaN;
  const deltaFlag =
    !Number.isNaN(num) && !Number.isNaN(priorNum)
      ? computeDeltaFlag(num, priorNum, 50)
      : false;

  const isCritical = flag === "CRITICAL_LOW" || flag === "CRITICAL_HIGH";
  const status = shouldAutoVerify(flag, deltaFlag, isCritical) ? "VALIDATED" : "PENDING";

  const result = await prisma.result.upsert({
    where: { orderItemId },
    create: {
      tenantId: id,
      orderItemId,
      value: rawValue,
      unit: item.test.unit,
      flag,
      status,
      validatedAt: status === "VALIDATED" ? new Date() : null,
    },
    update: {
      value: rawValue,
      flag,
      status,
      validatedAt: status === "VALIDATED" ? new Date() : null,
    },
  });

  try {
    await decrementForTest(id, item.testId);
  } catch (err) {
    console.error("Reagent decrement failed:", err);
  }

  await recordAudit({
    tenantId: id,
    userId: undefined,
    action: "result.entered",
    entity: "Result",
    entityId: result.id,
  });

  return result;
}

export async function advanceSpecimen(tenantId: string, specimenId: string) {
  const id = assertTenant(tenantId);
  const specimen = await prisma.specimen.findFirst({
    where: { id: specimenId, tenantId: id },
  });
  if (!specimen) throw new Error("Specimen not found");

  const next = nextStage(specimen.status);
  if (!next) throw new Error(`Already at the final stage (${specimen.status})`);

  // Site movement and note depend on which transition this is.
  let fromSiteId: string | null = null;
  let toSiteId: string | null = null;
  let newCurrentSiteId: string | null = specimen.currentSiteId;
  let note = "";

  if (next === "IN_TRANSIT") {
    fromSiteId = specimen.currentSiteId;
    note = "Left collection site for the hub";
  } else if (next === "RECEIVED") {
    const hub = await prisma.site.findFirst({ where: { tenantId: id, type: "HUB" } });
    toSiteId = hub?.id ?? null;
    newCurrentSiteId = hub?.id ?? specimen.currentSiteId;
    note = "Received at the hub";
  } else if (next === "IN_PROGRESS") {
    note = "Testing started";
  } else if (next === "RESULTED") {
    note = "Resulted";
  }

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const updated = await tx.specimen.update({
      where: { id: specimen.id },
      data: { status: next, currentSiteId: newCurrentSiteId },
    });

    await tx.specimenEvent.create({
      data: {
        tenantId: id,
        specimenId: specimen.id,
        status: next,
        fromSiteId,
        toSiteId,
        note,
      },
    });

    // Keep the order status loosely in step with the specimen.
    if (next === "IN_PROGRESS") {
      await tx.order.update({ where: { id: specimen.orderId }, data: { status: "IN_PROGRESS" } });
    } else if (next === "RESULTED") {
      await tx.order.update({ where: { id: specimen.orderId }, data: { status: "COMPLETED" } });
    }

    return updated;
  });
}

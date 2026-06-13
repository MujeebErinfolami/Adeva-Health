import { createHash } from "crypto";

// Produces deterministic JSON regardless of property insertion order.
function stableJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableJson).join(",")}]`;
  }
  if (value !== null && typeof value === "object") {
    const keys = Object.keys(value as object).sort();
    return `{${keys
      .map((k) => `${JSON.stringify(k)}:${stableJson((value as Record<string, unknown>)[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

export function computeRowHash(prevHash: string | null, row: object): string {
  const payload = stableJson({ prevHash, ...row });
  return createHash("sha256").update(payload).digest("hex");
}

export function verifyChain(
  rows: Array<{ hash: string; prevHash: string | null; [key: string]: unknown }>
): boolean {
  for (let i = 0; i < rows.length; i++) {
    const { hash, prevHash, ...data } = rows[i];

    // Each row's prevHash must point at the preceding row's hash (null for the first).
    const expectedPrevHash = i === 0 ? null : rows[i - 1].hash;
    if (prevHash !== expectedPrevHash) return false;

    // Recompute the hash over prevHash + row data (excluding the stored hash itself).
    if (computeRowHash(prevHash, data) !== hash) return false;
  }
  return true;
}

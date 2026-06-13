import { computeZScore } from "@/lib/qc/stats";

export function evaluateWestgard(
  values: number[],
  mean: number,
  sd: number
): string[] {
  const violations: string[] = [];
  const zScores = values.map((v) => computeZScore(v, mean, sd));

  // 1:3s — any single value beyond ±3 SD
  if (zScores.some((z) => Math.abs(z) > 3)) {
    violations.push("1:3s");
  }

  // 2:2s — two consecutive values beyond ±2 on the same side
  for (let i = 0; i < zScores.length - 1; i++) {
    const a = zScores[i];
    const b = zScores[i + 1];
    if ((a > 2 && b > 2) || (a < -2 && b < -2)) {
      violations.push("2:2s");
      break;
    }
  }

  // R:4s — range between the last two z-scores exceeds 4
  if (zScores.length >= 2) {
    const last2 = zScores.slice(-2);
    if (Math.max(...last2) - Math.min(...last2) > 4) {
      violations.push("R:4s");
    }
  }

  // 10x — ten consecutive values all on the same side of the mean
  if (zScores.length >= 10) {
    const last10 = zScores.slice(-10);
    if (last10.every((z) => z > 0) || last10.every((z) => z < 0)) {
      violations.push("10x");
    }
  }

  return violations;
}

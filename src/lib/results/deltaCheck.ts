export function computeDeltaFlag(
  currentValue: number,
  priorValue: number,
  deltaThreshold: number
): boolean {
  if (priorValue === 0) return false;
  const percentChange = Math.abs((currentValue - priorValue) / priorValue) * 100;
  return percentChange > deltaThreshold;
}

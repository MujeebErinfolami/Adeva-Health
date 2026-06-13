export function computeZScore(value: number, mean: number, sd: number): number {
  if (sd === 0) return 0;
  return (value - mean) / sd;
}

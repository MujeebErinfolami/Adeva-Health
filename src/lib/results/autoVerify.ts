export function shouldAutoVerify(
  flag: string | null,
  deltaFlag: boolean,
  isCritical: boolean
): boolean {
  return (flag === null || flag === "NORMAL") && !deltaFlag && !isCritical;
}

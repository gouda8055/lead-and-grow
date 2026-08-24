export function s1Opacity(p: number): number {
  if (p < 0.2) return 1
  return Math.max(0, 1 - (p - 0.2) / 0.08)
}

export function s2Opacity(p: number): number {
  if (p < 0.32) return 0
  if (p < 0.4) return (p - 0.32) / 0.08
  if (p < 0.55) return 1
  return Math.max(0, 1 - (p - 0.55) / 0.08)
}

export function s3Opacity(p: number): number {
  if (p < 0.67) return 0
  if (p < 0.75) return (p - 0.67) / 0.08
  return 1
}

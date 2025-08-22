export function lerp(t: number, a: number, b: number): number {
  return a + (b - a) * t;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
  clamped: boolean = true
): number {
  const result =
    ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
  return clamped ? clamp(result, outMin, outMax) : result;
}

export function easeCircInOut(t: number): number {
  return t < 0.5
    ? 0.5 * (1 - Math.sqrt(1 - 4 * t * t))
    : 0.5 * (Math.sqrt(-((2 * t - 3) * (2 * t - 1))) + 1);
}

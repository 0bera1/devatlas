/** WCAG 2.x göreli parlaklık ve kontrast oranı. Girdi #RRGGBB biçimindedir. */

function channelToLinear(channel: number): number {
  const srgb: number = channel / 255;
  return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  const value: string = hex.replace('#', '');
  const r: number = parseInt(value.slice(0, 2), 16);
  const g: number = parseInt(value.slice(2, 4), 16);
  const b: number = parseInt(value.slice(4, 6), 16);
  return 0.2126 * channelToLinear(r) + 0.7152 * channelToLinear(g) + 0.0722 * channelToLinear(b);
}

/** İki renk arasındaki kontrast oranı (1 ile 21 arası). */
export function contrastRatio(first: string, second: string): number {
  const a: number = relativeLuminance(first);
  const b: number = relativeLuminance(second);
  const lighter: number = Math.max(a, b);
  const darker: number = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

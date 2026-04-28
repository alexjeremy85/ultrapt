/**
 * Garante contraste minimo de uma cor accent contra fundos claros ou escuros.
 *
 * Calcula luminancia relativa (formula WCAG simplificada). Se a cor for muito
 * escura para um fundo escuro (ou clara demais para fundo claro), ajusta
 * mantendo o tom mas mudando a luminosidade.
 */

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace("#", "");
  if (clean.length !== 3 && clean.length !== 6) return null;
  const full =
    clean.length === 3
      ? clean.split("").map((c) => c + c).join("")
      : clean;
  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return null;
  return {
    r: (num >> 16) & 0xff,
    g: (num >> 8) & 0xff,
    b: num & 0xff,
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

function rgbToHsl(r: number, g: number, b: number) {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)); break;
      case gn: h = ((bn - rn) / d + 2); break;
      case bn: h = ((rn - gn) / d + 4); break;
    }
    h *= 60;
  }
  return { h, s, l };
}

function hslToRgb(h: number, s: number, l: number) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0, g = 0, b = 0;
  if (0 <= hp && hp < 1) [r, g, b] = [c, x, 0];
  else if (hp < 2) [r, g, b] = [x, c, 0];
  else if (hp < 3) [r, g, b] = [0, c, x];
  else if (hp < 4) [r, g, b] = [0, x, c];
  else if (hp < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const m = l - c / 2;
  return {
    r: (r + m) * 255,
    g: (g + m) * 255,
    b: (b + m) * 255,
  };
}

/**
 * Luminancia relativa simplificada (0 = preto, 1 = branco)
 */
export function luminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;
  return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
}

/**
 * Garante que a cor seja legivel sobre fundo escuro (preto/quase-preto).
 * Se for muito escura, clareia mantendo o tom.
 */
export function ensureReadableOnDark(hex: string, minLuminance = 0.45): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const lum = luminance(hex);
  if (lum >= minLuminance) return hex;
  const { h, s } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  // Se saturacao zero (cinza) usa cinza claro padrao
  const newS = s < 0.1 ? 0 : Math.max(s, 0.4);
  // Lightness alta o suficiente pra contrastar em fundo preto
  const newL = 0.6;
  const out = hslToRgb(h, newS, newL);
  return rgbToHex(out.r, out.g, out.b);
}

/**
 * Garante que a cor seja legivel sobre fundo claro (branco).
 */
export function ensureReadableOnLight(hex: string, maxLuminance = 0.65): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const lum = luminance(hex);
  if (lum <= maxLuminance) return hex;
  const { h, s } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const newS = s < 0.1 ? 0 : Math.max(s, 0.4);
  const newL = 0.35;
  const out = hslToRgb(h, newS, newL);
  return rgbToHex(out.r, out.g, out.b);
}

/**
 * Retorna texto preto ou branco que contrasta melhor com a cor de fundo.
 */
export function contrastingTextColor(bgHex: string): "#000000" | "#ffffff" {
  return luminance(bgHex) > 0.55 ? "#000000" : "#ffffff";
}

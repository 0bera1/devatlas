import type { CSSProperties } from 'react';

/** @param value — 0–1 arası normalize */
export function map(
  value: number,
  start: number,
  end: number,
): number {
  if (end <= start) {
    return 0;
  }
  const t: number = (value - start) / (end - start);
  return t < 0 ? 0 : t > 1 ? 1 : t;
}

/** Smoothstep (Ken Perlin) */
export function ease(t: number): number {
  const x: number = t < 0 ? 0 : t > 1 ? 1 : t;
  return x * x * (3 - 2 * x);
}

function clamp01(value: number): number {
  if (value < 0) {
    return 0;
  }
  if (value > 1) {
    return 1;
  }
  return value;
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t: number = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/** Senaryo beat’i: başlık + Keşif / Bilgi tabanı / Dokümanlar kademeleri. */
export const SCENARIO_SCROLL_START = 0.2;
export const SCENARIO_SCROLL_END = 0.44;

/** Akış tablosu + düğüm/kenar çizimi. */
export const FLOW_SCROLL_START = 0.42;
export const FLOW_SCROLL_END = 0.64;

/** Cam masa beat’i. */
export const INTERVIEW_SCROLL_START = 0.62;
export const INTERVIEW_SCROLL_END = 0.83;

/**
 * Verilen scroll bandında 0→1 normalleştirilmiş zaman çizelgesi.
 */
export function bandNormalized(
  scroll: number,
  bandStart: number,
  bandEnd: number,
): number {
  return map(scroll, bandStart, bandEnd);
}

/**
 * Band içinde kademeli görünürlük (pencere içinde ease-in opaklık).
 */
export function revealStagger(
  bandT: number,
  windowStart: number,
  windowEnd: number,
): number {
  return ease(map(bandT, windowStart, windowEnd));
}

function easeOutCubic(x: number): number {
  const inv: number = 1 - clamp01(x);
  return 1 - inv * inv * inv;
}

/**
 * Canvas / fizik motoru + UI beat’leri için tek kaynak.
 * Scroll segmentleri: Hero 0–0.2, Senaryo 0.2–0.45, Akış 0.45–0.65, Mülakat 0.65–0.85, CTA 0.85–1
 */
export interface GraphSimulationState {
  readonly scroll: number;
  readonly chaosLevel: number;
  readonly structureLevel: number;
  readonly density: number;
  readonly coherence: number;
  readonly activity: number;
  readonly aiMagic: number;
  readonly flowEmphasis: number;
  readonly ctaLock: number;
  readonly beatHero: number;
  readonly beatScenario: number;
  readonly beatFlow: number;
  readonly beatInterview: number;
  readonly beatCta: number;
  readonly interactionBoost: number;
}

export function deriveScenePhysics(
  progress: number,
  interactionBoost: number,
): GraphSimulationState {
  const t: number = clamp01(progress);

  const chaosLevel: number = clamp01(
    1 - easeOutCubic(smoothstep(0.08, 0.42, t)),
  );
  const structureLevel: number = easeOutCubic(smoothstep(0.18, 0.62, t));
  const coherence: number = easeOutCubic(smoothstep(0.22, 0.68, t));
  const density: number = 0.32 + 0.68 * easeOutCubic(smoothstep(0.35, 0.95, t));
  const activity: number =
    smoothstep(0.62, 0.82, t) * (1 - smoothstep(0.88, 0.97, t));
  const aiMagic: number =
    smoothstep(0.55, 0.78, t) * (1 - smoothstep(0.82, 0.95, t));
  const flowEmphasis: number = smoothstep(0.42, 0.66, t) * (1 - smoothstep(0.68, 0.8, t));
  const ctaLock: number = smoothstep(0.84, 1, t);

  const beatHero: number = 1 - smoothstep(0.05, 0.22, t);
  const beatScenario: number =
    smoothstep(0.17, 0.24, t) * (1 - smoothstep(0.43, 0.5, t));
  const beatFlow: number =
    smoothstep(0.39, 0.46, t) * (1 - smoothstep(0.63, 0.69, t));
  const beatInterview: number =
    smoothstep(0.59, 0.66, t) * (1 - smoothstep(0.81, 0.87, t));
  const beatCta: number = smoothstep(0.8, 0.9, t);

  return {
    scroll: t,
    chaosLevel,
    structureLevel,
    density,
    coherence,
    activity,
    aiMagic,
    flowEmphasis,
    ctaLock,
    beatHero,
    beatScenario,
    beatFlow,
    beatInterview,
    beatCta,
    interactionBoost,
  };
}

export function computeCameraStyle(state: GraphSimulationState): CSSProperties {
  const ctaEase: number = ease(state.beatCta);
  const settle: number = ctaEase * 0.92;

  let driftX: number =
    Math.sin(state.scroll * Math.PI * 2.4) *
    48 *
    (0.9 - state.structureLevel * 0.55);
  let driftY: number =
    state.scroll * -22 +
    Math.sin(state.scroll * Math.PI * 1.3) * 10 * (1 - state.coherence);
  let scale: number =
    1 +
    0.05 * Math.sin(state.scroll * Math.PI) * (1 - state.coherence * 0.8) -
    state.scroll * 0.035 +
    state.ctaLock * 0.025;
  let rotX: number =
    2.8 * Math.sin(state.scroll * Math.PI) * (1 - state.coherence * 0.82);
  let rotZ: number =
    Math.sin(state.scroll * Math.PI * 0.5) * 1.2 * (1 - state.structureLevel);

  driftX *= 1 - settle;
  driftY *= 1 - settle;
  rotX *= 1 - settle;
  rotZ *= 1 - settle * 0.85;
  scale = scale + (1 - scale) * ctaEase * 0.12;

  return {
    transform: `translate3d(${driftX}px, ${driftY}px, 0) scale(${scale}) rotateX(${rotX}deg) rotateZ(${rotZ}deg)`,
    transformOrigin: '50% 45%',
    transformStyle: 'preserve-3d',
    willChange: 'transform',
  };
}

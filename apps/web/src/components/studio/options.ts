import type { AspectRatio, DurationSec, Engine, Resolution } from "@/lib/api-types";

export const DURATIONS: readonly DurationSec[] = [15, 20, 30];

export const ASPECTS: ReadonlyArray<{ value: AspectRatio; label: string }> = [
  { value: "9:16", label: "세로 (9:16)" },
  { value: "16:9", label: "가로 (16:9)" },
];

export const RESOLUTIONS: readonly Resolution[] = ["720p", "1080p"];

export const ENGINES: ReadonlyArray<{ value: Engine; label: string; hint: string }> = [
  { value: "distilled", label: "LTX-Distilled", hint: "고속 프리뷰 · 4~8 스텝" },
  { value: "dev", label: "LTX-Dev", hint: "고화질 정밀" },
];

export const MARKETING_TAGS = ["Cinematic lighting", "Smooth pan", "Hyper-realistic product shot"] as const;

/** PRD §3.1 해상도 표 */
export function frameSize(aspect: AspectRatio, resolution: Resolution): string {
  const [short, long] = resolution === "720p" ? [720, 1280] : [1080, 1920];
  return aspect === "9:16" ? `${short} × ${long}` : `${long} × ${short}`;
}

export function engineLabel(engine: Engine): string {
  return ENGINES.find((e) => e.value === engine)?.label ?? engine;
}

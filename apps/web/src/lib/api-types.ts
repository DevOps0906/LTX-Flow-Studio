// 워커(FastAPI) 계약 타입 — 정본: apps/api/app/schemas.py. 워커 스키마가 바뀌면 이 파일만 맞춘다.

export type DurationSec = 15 | 20 | 30;
export type AspectRatio = "9:16" | "16:9";
export type Resolution = "720p" | "1080p";
export type Engine = "distilled" | "dev";
export type Stage = 1 | 2;
/** 워커가 running_stage1/2 등 세분 상태를 보내도 normalizeStatus()에서 running으로 접는다. */
export type JobStatus = "queued" | "running" | "done" | "failed";

/** POST /api/jobs 본문 (JobCreate) */
export interface JobCreateRequest {
  prompt: string;
  negative_prompt: string;
  duration: DurationSec;
  aspect: AspectRatio;
  resolution: Resolution;
  engine: Engine;
  /** [1] = LTX 직접 생성(단독 완결), [1, 2] = ComfyUI 고해상도 포함 */
  stages: Stage[];
}

/** Job 응답 */
export interface Job {
  id: string;
  status: JobStatus;
  /** 0~100 */
  progress: number;
  message: string;
  prompt: string;
  negative_prompt: string;
  duration: DurationSec;
  aspect: AspectRatio;
  resolution: Resolution;
  engine: Engine;
  stages: Stage[];
  created_at: string;
  updated_at: string;
  /** 워커 기준 경로(/api/files/{id}.mp4). 완료 전에는 null */
  video_url: string | null;
}

/** SSE /api/jobs/{id}/events 의 `event: progress` data(JSON) — progress.py ProgressEvent */
export interface JobEvent {
  status: JobStatus;
  progress: number;
  message: string;
}

/** GET /api/gpu (GpuInfo) */
export interface GpuInfo {
  ready: boolean;
  name: string | null;
  vram_total_mb: number | null;
  vram_used_mb: number | null;
}

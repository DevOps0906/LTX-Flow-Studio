import type { GpuInfo, Job, JobCreateRequest, JobEvent, JobStatus } from "./api-types";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");

/** 워커 기준 경로(/api/...)를 워커 주소와 합친다. */
export function apiUrl(path: string): string {
  return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

/** 상태 비교는 여기 한 곳에서만: running* 접두사(running_stage1/2 등)는 running으로 본다. */
export function normalizeStatus(raw: unknown): JobStatus | null {
  if (typeof raw !== "string") return null;
  if (raw.startsWith("running")) return "running";
  return raw === "queued" || raw === "done" || raw === "failed" ? raw : null;
}

export function isTerminal(status: JobStatus): boolean {
  return status === "done" || status === "failed";
}

function normalizeJob(job: Job): Job {
  return { ...job, status: normalizeStatus(job.status) ?? "queued" };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(apiUrl(path), { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  } catch (e) {
    if (init?.signal?.aborted) throw e;
    throw new ApiError("워커에 연결할 수 없습니다. 워커가 실행 중인지 확인해 주세요.", 0);
  }
  if (!res.ok) {
    throw new ApiError(`요청이 실패했습니다 (${res.status}).`, res.status);
  }
  return (await res.json()) as T;
}

/** POST /api/jobs */
export async function createJob(body: JobCreateRequest): Promise<Job> {
  return normalizeJob(await request<Job>("/api/jobs", { method: "POST", body: JSON.stringify(body) }));
}

/** GET /api/jobs */
export async function listJobs(signal?: AbortSignal): Promise<Job[]> {
  return (await request<Job[]>("/api/jobs", { signal })).map(normalizeJob);
}

/** GET /api/jobs/{id} — 완료 후 video_url 조회용 */
export async function getJob(jobId: string): Promise<Job> {
  return normalizeJob(await request<Job>(`/api/jobs/${encodeURIComponent(jobId)}`));
}

/** GET /api/gpu */
export function getGpu(signal?: AbortSignal): Promise<GpuInfo> {
  return request<GpuInfo>("/api/gpu", { signal });
}

function parseEvent(raw: string): JobEvent | null {
  try {
    const v: unknown = JSON.parse(raw);
    if (typeof v !== "object" || v === null) return null;
    const o = v as Record<string, unknown>;
    const status = normalizeStatus(o.status);
    if (!status || typeof o.progress !== "number") return null;
    return {
      status,
      progress: Math.min(100, Math.max(0, o.progress)),
      message: typeof o.message === "string" ? o.message : "",
    };
  } catch {
    return null;
  }
}

/** SSE /api/jobs/{id}/events(`event: progress`) 구독. 완료·실패 이벤트를 받으면 스스로 닫는다. 반환값으로 구독 해제. */
export function subscribeJobEvents(
  jobId: string,
  handlers: { onEvent: (e: JobEvent) => void; onError: (message: string) => void },
): () => void {
  const source = new EventSource(apiUrl(`/api/jobs/${encodeURIComponent(jobId)}/events`));
  source.addEventListener("progress", (msg: MessageEvent<string>) => {
    const event = parseEvent(msg.data);
    if (!event) return;
    if (isTerminal(event.status)) source.close();
    handlers.onEvent(event);
  });
  source.onerror = () => {
    // EventSource는 자동 재연결한다. 완전히 닫힌 경우만 오류로 알린다.
    if (source.readyState === EventSource.CLOSED) handlers.onError("진행 상황 연결이 끊겼습니다.");
  };
  return () => source.close();
}

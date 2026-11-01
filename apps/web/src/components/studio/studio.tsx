"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, apiUrl, createJob, getJob, listJobs, subscribeJobEvents } from "@/lib/api";
import type { Job, JobCreateRequest } from "@/lib/api-types";
import { ControlPanel, type Settings } from "./control-panel";
import { PlayerPanel, type RunMeta, type RunState } from "./player-panel";
import { RecentGallery, type GalleryState } from "./recent-gallery";

const INITIAL_SETTINGS: Settings = {
  prompt: "",
  negativePrompt: "",
  duration: 15,
  aspect: "9:16",
  resolution: "1080p",
  engine: "distilled",
};

const IDLE: RunState = { phase: "idle", jobId: null, progress: 0, message: null, videoUrl: null, error: null };

function toRequest(s: Settings): JobCreateRequest {
  return {
    prompt: s.prompt.trim(),
    negative_prompt: s.negativePrompt.trim(),
    duration: s.duration,
    aspect: s.aspect,
    resolution: s.resolution,
    engine: s.engine,
    stages: [1],
  };
}

function errorMessage(e: unknown): string {
  return e instanceof ApiError ? e.message : "알 수 없는 오류가 발생했습니다.";
}

/** 대시보드 본문(PRD §4.2): 좌 설정 · 우 플레이어 · 하단 최근 갤러리. */
export function Studio() {
  const [settings, setSettings] = useState<Settings>(INITIAL_SETTINGS);
  const [run, setRun] = useState<RunState>(IDLE);
  const [meta, setMeta] = useState<RunMeta | null>(null);
  const [gallery, setGallery] = useState<GalleryState>({ kind: "loading" });
  const lastRequest = useRef<JobCreateRequest | null>(null);
  const unsubscribe = useRef<(() => void) | null>(null);

  const loadGallery = useCallback(async (signal?: AbortSignal) => {
    setGallery({ kind: "loading" });
    try {
      const jobs = await listJobs(signal);
      setGallery({ kind: "ready", jobs });
    } catch (e) {
      if (signal?.aborted) return;
      setGallery({ kind: "error", message: errorMessage(e) });
    }
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    // 마운트 시 1회 목록 조회(외부 시스템 동기화).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadGallery(ctrl.signal);
    return () => {
      ctrl.abort();
      unsubscribe.current?.();
    };
  }, [loadGallery]);

  const start = useCallback(
    async (req: JobCreateRequest) => {
      unsubscribe.current?.();
      lastRequest.current = req;
      setMeta({ prompt: req.prompt, duration: req.duration, aspect: req.aspect, resolution: req.resolution });
      setRun({ ...IDLE, phase: "submitting", message: "작업 등록 중" });
      let job: Job;
      try {
        job = await createJob(req);
      } catch (e) {
        setRun({ ...IDLE, phase: "error", error: errorMessage(e) });
        return;
      }
      setRun({ ...IDLE, phase: "running", jobId: job.id, progress: job.progress, message: job.message ?? "대기 중" });
      unsubscribe.current = subscribeJobEvents(job.id, {
        onEvent: (ev) => {
          if (ev.status === "done") {
            // SSE에는 video_url이 없어 완료 후 잡을 다시 조회한다.
            setRun((r) => ({ ...r, progress: 100, message: ev.message }));
            getJob(job.id)
              .then((done) =>
                setRun({ ...IDLE, phase: "done", jobId: job.id, progress: 100, message: ev.message, videoUrl: done.video_url ? apiUrl(done.video_url) : null }),
              )
              .catch((e: unknown) => setRun({ ...IDLE, phase: "error", jobId: job.id, error: errorMessage(e) }));
            void loadGallery();
          } else if (ev.status === "failed") {
            setRun({ ...IDLE, phase: "error", jobId: job.id, error: ev.message || "생성에 실패했습니다." });
            void loadGallery();
          } else {
            setRun((r) => ({ ...r, progress: ev.progress, message: ev.message }));
          }
        },
        onError: (message) => setRun((r) => ({ ...r, phase: "error", error: message })),
      });
    },
    [loadGallery],
  );

  const selectJob = (job: Job) => {
    if (!job.video_url) return;
    setMeta({ prompt: job.prompt, duration: job.duration, aspect: job.aspect, resolution: job.resolution });
    setRun({ ...IDLE, phase: "done", jobId: job.id, progress: 100, videoUrl: apiUrl(job.video_url) });
  };

  const busy = run.phase === "submitting" || run.phase === "running";
  const shownMeta: RunMeta = meta ?? { prompt: settings.prompt, duration: settings.duration, aspect: settings.aspect, resolution: settings.resolution };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 desktop:grid-cols-12">
      <div className="desktop:col-span-5">
        <ControlPanel
          settings={settings}
          onChange={(patch) => setSettings((s) => ({ ...s, ...patch }))}
          onSubmit={() => void start(toRequest(settings))}
          busy={busy}
        />
      </div>
      <div className="desktop:col-span-7">
        <PlayerPanel
          run={run}
          meta={shownMeta}
          onRegenerate={() => {
            if (lastRequest.current) void start(lastRequest.current);
          }}
        />
      </div>
      <div className="md:col-span-2 desktop:col-span-12">
        <RecentGallery state={gallery} onRetry={() => void loadGallery()} onSelect={selectJob} />
      </div>
    </div>
  );
}

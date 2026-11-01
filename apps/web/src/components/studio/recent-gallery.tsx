"use client";

import type { Job } from "@/lib/api-types";
import { apiUrl } from "@/lib/api";
import { cn, focusRing } from "@/lib/cn";
import { Panel } from "./panel";

export type GalleryState = { kind: "loading" } | { kind: "error"; message: string } | { kind: "ready"; jobs: Job[] };

const STATUS_LABEL: Record<Job["status"], string> = { queued: "대기", running: "생성 중", done: "완료", failed: "실패" };

export function RecentGallery({ state, onRetry, onSelect }: { state: GalleryState; onRetry: () => void; onSelect: (job: Job) => void }) {
  return (
    <Panel id="gallery-title" title="최근 생성한 영상">
      {state.kind === "loading" ? (
        <ul aria-busy="true" aria-label="불러오는 중" className="grid grid-cols-2 gap-3 md:grid-cols-3 desktop:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="aspect-video animate-pulse rounded-card bg-surface-high" />
          ))}
        </ul>
      ) : state.kind === "error" ? (
        <div role="alert" className="flex flex-col items-start gap-2 text-body text-text-muted">
          <p>{state.message}</p>
          <button type="button" onClick={onRetry} className={cn("rounded-control border border-border px-3 py-1 text-body text-text hover:bg-surface-high", focusRing)}>
            다시 시도
          </button>
        </div>
      ) : state.jobs.length === 0 ? (
        <p className="text-body text-text-muted">아직 생성한 영상이 없습니다.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 desktop:grid-cols-4">
          {state.jobs.map((job, i) => (
            <li key={job.id} className={cn(i === 0 && "col-span-2 row-span-2")}>
              <button
                type="button"
                onClick={() => onSelect(job)}
                disabled={job.status !== "done" || !job.video_url}
                className={cn(
                  "group flex size-full min-h-24 flex-col justify-between gap-2 rounded-card border border-border bg-bg p-3 text-left hover:border-accent disabled:cursor-default disabled:hover:border-border",
                  focusRing,
                )}
              >
                {job.status === "done" && job.video_url ? (
                  <video src={apiUrl(job.video_url)} muted preload="metadata" className="aspect-video w-full rounded-control object-cover" />
                ) : null}
                <span className="line-clamp-2 text-caption text-text">{job.prompt}</span>
                <span className="flex items-center justify-between text-caption text-text-muted">
                  <span>{job.duration}초 · {job.aspect}</span>
                  <span className={cn(job.status === "failed" && "text-danger", job.status === "done" && "text-success")}>{STATUS_LABEL[job.status]}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

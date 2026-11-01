"use client";

import { useState } from "react";
import type { AspectRatio, DurationSec, Resolution } from "@/lib/api-types";
import { cn, focusRing } from "@/lib/cn";
import { Panel } from "./panel";
import { frameSize } from "./options";

export type RunPhase = "idle" | "submitting" | "running" | "done" | "error";

export interface RunState {
  phase: RunPhase;
  jobId: string | null;
  progress: number;
  message: string | null;
  videoUrl: string | null;
  error: string | null;
}

export interface RunMeta {
  prompt: string;
  duration: DurationSec;
  aspect: AspectRatio;
  resolution: Resolution;
}

const actionClass = cn(
  "inline-flex min-h-10 items-center justify-center rounded-control border border-border px-3 text-body hover:bg-surface-high disabled:cursor-not-allowed disabled:opacity-50",
  focusRing,
);

export function PlayerPanel({ run, meta, onRegenerate }: { run: RunState; meta: RunMeta; onRegenerate: () => void }) {
  const [copied, setCopied] = useState(false);
  const busy = run.phase === "submitting" || run.phase === "running";

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(meta.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Panel id="player-title" title="미리보기">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-center rounded-card bg-bg">
          <div
            className={cn(
              "relative flex max-h-(--size-player-max) w-full items-center justify-center overflow-hidden rounded-card border border-border",
              meta.aspect === "9:16" ? "aspect-[9/16] max-w-sm" : "aspect-video",
            )}
          >
            {run.phase === "done" && run.videoUrl ? (
              <video key={run.videoUrl} src={run.videoUrl} controls loop autoPlay muted playsInline className="size-full object-contain">
                <track kind="captions" />
              </video>
            ) : (
              <PlayerPlaceholder run={run} />
            )}
          </div>
        </div>

        {busy ? <Progress value={run.progress} message={run.message} /> : null}

        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-caption text-text-muted">
          <dt>해상도</dt>
          <dd className="text-text">{meta.resolution} · {meta.aspect} ({frameSize(meta.aspect, meta.resolution)})</dd>
          <dt>길이</dt>
          <dd className="text-text">{meta.duration}초</dd>
        </dl>

        <div className="flex flex-wrap gap-2">
          {run.phase === "done" && run.videoUrl ? (
            <a href={run.videoUrl} download className={actionClass}>MP4 다운로드</a>
          ) : (
            <button type="button" disabled className={actionClass}>MP4 다운로드</button>
          )}
          <button type="button" onClick={copyPrompt} disabled={!meta.prompt.trim()} className={actionClass}>
            {copied ? "복사됨" : "프롬프트 복사"}
          </button>
          <button type="button" onClick={onRegenerate} disabled={busy || run.jobId === null} className={actionClass}>
            재생성
          </button>
        </div>
        <p aria-live="polite" className="sr-only">{copied ? "프롬프트를 복사했습니다" : ""}</p>
      </div>
    </Panel>
  );
}

function PlayerPlaceholder({ run }: { run: RunState }) {
  if (run.phase === "error") {
    return (
      <p role="alert" className="px-4 text-center text-body text-danger">
        {run.error ?? "생성에 실패했습니다."}
      </p>
    );
  }
  if (run.phase === "submitting" || run.phase === "running") {
    return <p className="px-4 text-center text-body text-text-muted">영상을 만드는 중입니다...</p>;
  }
  return <p className="px-4 text-center text-body text-text-muted">프롬프트를 입력하고 생성하면 여기에서 재생됩니다.</p>;
}

function Progress({ value, message }: { value: number; message: string | null }) {
  const pct = Math.round(value);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-caption">
        <span className="text-text-muted">{message ?? "대기 중"}</span>
        <span className="font-semibold tabular-nums text-text">{pct}%</span>
      </div>
      <div role="progressbar" aria-label="생성 진행률" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} className="h-2 overflow-hidden rounded-full bg-surface-high">
        <div className="h-full rounded-full bg-accent transition-[width]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

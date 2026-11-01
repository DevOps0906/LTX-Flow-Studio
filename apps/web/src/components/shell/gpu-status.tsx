"use client";

import { useEffect, useState } from "react";
import { getGpu } from "@/lib/api";
import type { GpuInfo } from "@/lib/api-types";
import { cn } from "@/lib/cn";

type GpuState = { kind: "loading" } | { kind: "error" } | { kind: "ready"; gpu: GpuInfo };

function gbText(mb: number): string {
  return `${(mb / 1024).toFixed(1)}GB`;
}

function label(state: GpuState): string {
  if (state.kind === "loading") return "GPU 상태 확인 중";
  if (state.kind === "error") return "워커 연결 안 됨";
  const name = state.gpu.name ?? "GPU";
  return state.gpu.ready ? `${name} · 준비됨` : `${name} · 사용 불가`;
}

/** VRAM 사용량(사용·전체 값이 모두 있을 때만). */
function vram(state: GpuState): { text: string; pct: number } | null {
  if (state.kind !== "ready") return null;
  const { vram_used_mb: used, vram_total_mb: total } = state.gpu;
  if (used === null || total === null || total <= 0) return null;
  return { text: `VRAM ${gbText(used)} / ${gbText(total)}`, pct: Math.round((used / total) * 100) };
}

/** GNB 하단 GPU 상태(GET /api/gpu). 마운트 시 1회 조회. 데스크톱·드로어=카드, 태블릿 레일=점+VRAM%. */
export function GpuStatus() {
  const [state, setState] = useState<GpuState>({ kind: "loading" });

  useEffect(() => {
    const ctrl = new AbortController();
    getGpu(ctrl.signal)
      .then((gpu) => setState({ kind: "ready", gpu }))
      .catch(() => {
        if (!ctrl.signal.aborted) setState({ kind: "error" });
      });
    return () => ctrl.abort();
  }, []);

  const ok = state.kind === "ready" && state.gpu.ready;
  const bad = state.kind === "error" || (state.kind === "ready" && !state.gpu.ready);
  const v = vram(state);
  const title = v ? `${label(state)} · ${v.text}` : label(state);

  return (
    <section
      aria-label="GPU 상태"
      title={title}
      className="mt-auto grid gap-1.5 rounded-control border-(length:--border-width) border-border bg-bg p-3 md:justify-items-center md:p-2 desktop:justify-items-stretch desktop:p-3"
    >
      <p aria-live="polite" className="flex min-w-0 items-center gap-2 text-caption">
        <span aria-hidden className={cn("size-2 shrink-0 rounded-full", ok ? "bg-success" : bad ? "bg-danger" : "bg-text-muted")} />
        <span className="truncate md:sr-only desktop:not-sr-only">{label(state)}</span>
      </p>
      {v && (
        <>
          <span aria-hidden className="hidden font-mono text-caption text-text-muted tabular-nums md:block desktop:hidden">
            {v.pct}%
          </span>
          <div className="grid gap-1 md:hidden desktop:grid">
            <div
              role="progressbar"
              aria-label="VRAM 사용량"
              aria-valuenow={v.pct}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-2 overflow-hidden rounded-pill bg-surface-high"
            >
              <i className="block h-full rounded-pill bg-accent" style={{ width: `${v.pct}%` }} />
            </div>
            <span className="font-mono text-caption text-text-muted tabular-nums">{v.text}</span>
          </div>
        </>
      )}
    </section>
  );
}

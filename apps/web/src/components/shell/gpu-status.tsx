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
  const { gpu } = state;
  const name = gpu.name ?? "GPU";
  if (!gpu.ready) return `${name} · 사용 불가`;
  const vram = gpu.vram_total_mb !== null ? ` · ${gpu.vram_used_mb !== null ? `${gbText(gpu.vram_used_mb)}/` : ""}${gbText(gpu.vram_total_mb)}` : "";
  return `${name} · 준비됨${vram}`;
}

/** 헤더 GPU 상태(GET /api/gpu). 마운트 시 1회 조회. */
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
  return (
    <p aria-live="polite" className="ml-auto flex min-w-0 items-center gap-2 rounded-control border border-border px-3 py-1 text-caption text-text-muted">
      <span aria-hidden className={cn("size-2 shrink-0 rounded-full", ok ? "bg-success" : bad ? "bg-danger" : "bg-text-muted")} />
      <span className="truncate">{label(state)}</span>
    </p>
  );
}

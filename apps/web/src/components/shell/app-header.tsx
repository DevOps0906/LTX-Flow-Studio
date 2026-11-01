import { GpuStatus } from "./gpu-status";

/** 상단 바(PRD §4.2): 제품명 + GPU 상태. */
export function AppHeader() {
  return (
    <header className="flex h-(--size-header) items-center gap-3 border-b border-border bg-surface px-4 md:px-6 desktop:px-8">
      <p className="shrink-0 text-h2 font-semibold tracking-wide">LTX NOMAD STUDIO</p>
      <GpuStatus />
    </header>
  );
}

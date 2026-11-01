"use client";

import { cn, focusRing } from "@/lib/cn";

/** 단일 선택 버튼 묶음(라디오 그룹 의미). */
export function ToggleGroup<T extends string | number>({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string; hint?: string }>;
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(o.value)}
            className={cn(
              "flex min-h-10 flex-1 flex-col items-center justify-center rounded-control border px-3 py-2 text-body transition-colors disabled:cursor-not-allowed disabled:opacity-50",
              selected ? "border-accent bg-accent/15 font-semibold text-text shadow-glow" : "border-border text-text-muted hover:bg-surface-high",
              focusRing,
            )}
          >
            <span>{o.label}</span>
            {o.hint ? <span className="text-caption text-text-muted">{o.hint}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

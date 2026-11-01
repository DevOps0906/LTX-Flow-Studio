"use client";

import type { AspectRatio, DurationSec, Engine, Resolution } from "@/lib/api-types";
import { cn, focusRing } from "@/lib/cn";
import { Panel } from "./panel";
import { ASPECTS, DURATIONS, ENGINES, MARKETING_TAGS, RESOLUTIONS, engineLabel } from "./options";
import { ToggleGroup } from "./toggle-group";

export interface Settings {
  prompt: string;
  negativePrompt: string;
  duration: DurationSec;
  aspect: AspectRatio;
  resolution: Resolution;
  engine: Engine;
}

const fieldClass = cn(
  "w-full resize-y rounded-control border border-input bg-bg px-3 py-2 text-body text-text placeholder:text-text-muted",
  focusRing,
);

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-body font-semibold">
        <span className="text-accent">{n}.</span> {title}
      </legend>
      {children}
    </fieldset>
  );
}

export function ControlPanel({
  settings,
  onChange,
  onSubmit,
  busy,
}: {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onSubmit: () => void;
  busy: boolean;
}) {
  const canSubmit = settings.prompt.trim().length > 0 && !busy;

  const addTag = (tag: string) => {
    const p = settings.prompt.trim();
    if (p.toLowerCase().includes(tag.toLowerCase())) return;
    onChange({ prompt: p ? `${p}, ${tag}` : tag });
  };

  return (
    <Panel id="settings-title" title="설정">
      <form
        className="flex flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit) onSubmit();
        }}
      >
        <Step n={1} title="프롬프트 입력">
          <label htmlFor="prompt" className="sr-only">긍정 프롬프트</label>
          <textarea
            id="prompt"
            rows={4}
            value={settings.prompt}
            onChange={(e) => onChange({ prompt: e.target.value })}
            placeholder="제품을 강조하는 자연스러운 카메라 줌인..."
            className={fieldClass}
            disabled={busy}
          />
          <div className="flex flex-wrap gap-2" aria-label="추천 태그">
            {MARKETING_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                disabled={busy}
                onClick={() => addTag(tag)}
                className={cn("rounded-control border border-border px-2 py-1 text-caption text-text-muted hover:bg-surface-high disabled:opacity-50", focusRing)}
              >
                + {tag}
              </button>
            ))}
          </div>
          <label htmlFor="negative-prompt" className="mt-2 text-caption text-text-muted">부정 프롬프트 (선택)</label>
          <textarea
            id="negative-prompt"
            rows={2}
            value={settings.negativePrompt}
            onChange={(e) => onChange({ negativePrompt: e.target.value })}
            placeholder="흐림, 왜곡, 워터마크"
            className={fieldClass}
            disabled={busy}
          />
        </Step>

        <Step n={2} title="영상 길이 선택">
          <ToggleGroup
            label="영상 길이"
            value={settings.duration}
            options={DURATIONS.map((d) => ({ value: d, label: `${d}초` }))}
            onChange={(duration) => onChange({ duration })}
            disabled={busy}
          />
        </Step>

        <Step n={3} title="화면 비율 및 해상도">
          <ToggleGroup label="화면 비율" value={settings.aspect} options={ASPECTS} onChange={(aspect) => onChange({ aspect })} disabled={busy} />
          <ToggleGroup
            label="해상도"
            value={settings.resolution}
            options={RESOLUTIONS.map((r) => ({ value: r, label: r }))}
            onChange={(resolution) => onChange({ resolution })}
            disabled={busy}
          />
        </Step>

        <Step n={4} title="추론 엔진">
          <ToggleGroup label="추론 엔진" value={settings.engine} options={ENGINES} onChange={(engine) => onChange({ engine })} disabled={busy} />
        </Step>

        <button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            "min-h-12 rounded-control bg-accent px-4 text-body font-semibold text-on-accent shadow-glow transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none",
            focusRing,
          )}
        >
          {busy ? "생성 중..." : `${settings.duration}초 영상 생성하기 (${engineLabel(settings.engine)})`}
        </button>
      </form>
    </Panel>
  );
}

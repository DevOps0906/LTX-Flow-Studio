/** 릴리스 2 예정 화면 자리(시안 v2 page-head + 카드). 동작하는 입력·API 호출 없음. */
export function ComingSoon({ title, description, features }: { title: string; description: string; features: readonly string[] }) {
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-h1 leading-tight font-semibold">{title}</h1>
          <p className="text-text-muted">{description}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-pill border-(length:--border-width) border-border px-2.5 py-0.5 text-caption whitespace-nowrap text-accent-text">
          <span aria-hidden className="size-1.5 rounded-full bg-current" />
          준비 중 · 릴리스 2
        </span>
      </div>
      <section aria-labelledby="planned-h" className="grid gap-4 rounded-card border-(length:--border-width) border-border bg-surface p-4 md:p-5">
        <h2 id="planned-h" className="text-h2 font-semibold">예정 기능</h2>
        <ul className="grid list-disc gap-2 pl-5 text-text-muted">
          {features.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </section>
    </>
  );
}

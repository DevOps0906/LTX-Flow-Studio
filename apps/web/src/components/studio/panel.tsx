import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Bento 카드 영역. 제목은 h2로 두고 aria-labelledby로 잇는다. */
export function Panel({ id, title, action, className, children }: { id: string; title: string; action?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className={cn("min-w-0 rounded-card border border-border bg-surface p-4 md:p-5 desktop:p-6", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id={id} className="text-h2 font-semibold">{title}</h2>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

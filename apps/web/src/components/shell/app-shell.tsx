"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn, focusRing } from "@/lib/cn";
import { GpuStatus } from "./gpu-status";
import { Icon, type IconName } from "./icons";

const NAV: ReadonlyArray<{ href: string; label: string; icon: IconName }> = [
  { href: "/dashboard", label: "대시보드", icon: "home" },
  { href: "/benchmark", label: "새로운 영상생성", icon: "studio" },
  { href: "/gallery", label: "갤러리", icon: "gallery" },
  { href: "/settings", label: "설정", icon: "settings" },
];

const iconBtn = cn(
  "inline-grid size-(--size-hit) shrink-0 place-items-center rounded-control border-(length:--border-width) border-border text-text hover:bg-surface-high",
  focusRing,
);

function Brand({ railHidden }: { railHidden?: boolean }) {
  return (
    <span className="flex items-center gap-2 font-bold whitespace-nowrap">
      <span aria-hidden className="inline-grid size-8 shrink-0 place-items-center rounded-control bg-accent text-caption font-extrabold text-on-accent">
        LTX
      </span>
      <span className={cn(railHidden && "md:hidden desktop:inline")}>Nomad Studio</span>
    </span>
  );
}

/**
 * 시안 v2 셸(DESIGN.md 7.1): 모바일 ~767 상단 바+햄버거 드로어 / 태블릿 768~1199 아이콘 레일 / 데스크톱 1200~ 라벨 GNB.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const openerRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  function close() {
    setOpen(false);
    openerRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    firstLinkRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        openerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 flex h-(--size-header) items-center gap-3 border-b-(length:--border-width) border-border bg-bg px-4 md:hidden">
        <button
          ref={openerRef}
          type="button"
          aria-label="메뉴 열기"
          aria-controls="gnb"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className={iconBtn}
        >
          <Icon name="menu" />
        </button>
        <Brand />
      </header>

      <div aria-hidden className={cn("fixed inset-0 z-30 bg-black/60 md:hidden", open ? "block" : "hidden")} onClick={close} />

      <nav
        id="gnb"
        aria-label="주 메뉴"
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-(--size-gnb) max-w-[85vw] flex-col gap-2 border-r-(length:--border-width) border-border bg-surface px-3 py-4",
          "transition-transform duration-(--motion-progress) ease-out",
          open ? "visible translate-x-0" : "invisible -translate-x-full",
          "md:visible md:w-(--size-gnb-rail) md:translate-x-0 md:items-center md:px-1.5 md:py-3",
          "desktop:w-(--size-gnb) desktop:items-stretch desktop:px-3 desktop:py-4",
        )}
      >
        <div className="flex items-center gap-2 px-2 pb-3 md:px-0 desktop:px-2">
          <Brand railHidden />
          <button type="button" aria-label="메뉴 닫기" onClick={close} className={cn(iconBtn, "ml-auto md:hidden")}>
            <Icon name="close" />
          </button>
        </div>

        <ul className="grid gap-1">
          {NAV.map((item, i) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  ref={i === 0 ? firstLinkRef : undefined}
                  href={item.href}
                  title={item.label}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex min-h-(--size-hit) items-center gap-3 rounded-control px-3 whitespace-nowrap",
                    "md:w-(--size-hit) md:justify-center md:px-0 desktop:w-auto desktop:justify-start desktop:px-3",
                    active
                      ? "bg-accent/18 font-semibold text-text shadow-[inset_calc(var(--spacing)*0.75)_0_0_var(--color-accent)]"
                      : "text-text-muted hover:bg-surface-high hover:text-text",
                    focusRing,
                  )}
                >
                  <Icon name={item.icon} className={cn(active && "text-accent-text")} />
                  <span className="md:sr-only desktop:not-sr-only">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <GpuStatus />
      </nav>

      <main className="grid min-w-0 gap-4 p-4 md:ml-(--size-gnb-rail) md:gap-5 md:p-6 desktop:ml-(--size-gnb) desktop:max-w-[calc(var(--size-gnb)*7.5)] desktop:p-8">
        {children}
      </main>
    </div>
  );
}

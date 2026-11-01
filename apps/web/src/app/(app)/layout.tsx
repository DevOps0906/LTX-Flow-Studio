import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/app-shell";

/** 좌측 GNB 셸을 쓰는 화면 묶음(대시보드·새로운 영상생성·갤러리·설정). */
export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}

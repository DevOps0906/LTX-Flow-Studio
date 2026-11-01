import type { Metadata } from "next";
import { ComingSoon } from "@/components/shell/coming-soon";

export const metadata: Metadata = { title: "갤러리 · LTX Nomad Studio" };

const FEATURES = ["생성한 영상 전체 목록", "영상별 프롬프트·설정 확인", "미리보기와 다운로드"] as const;

export default function GalleryPage() {
  return <ComingSoon title="갤러리" description="생성한 영상을 한곳에서 모아 봅니다." features={FEATURES} />;
}

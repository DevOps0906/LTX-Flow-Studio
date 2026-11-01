import type { Metadata } from "next";
import { ComingSoon } from "@/components/shell/coming-soon";

export const metadata: Metadata = { title: "설정 · LTX Nomad Studio" };

const FEATURES = [
  "분석 방식 기본값(로컬 / Claude API)",
  "Claude API 키 저장(서버에만 보관, 저장 후 값은 다시 표시하지 않음)",
  "연결 테스트와 키 삭제",
  "키 상태별 표시",
] as const;

export default function SettingsPage() {
  return <ComingSoon title="설정" description="분석 방식 기본값과 Claude API 연결을 관리합니다." features={FEATURES} />;
}

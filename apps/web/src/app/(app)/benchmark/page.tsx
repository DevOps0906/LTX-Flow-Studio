import type { Metadata } from "next";
import { ComingSoon } from "@/components/shell/coming-soon";

export const metadata: Metadata = { title: "새로운 영상생성 · LTX Nomad Studio" };

const FEATURES = [
  "참고할 유튜브 영상 URL 입력과 분석 시작",
  "분석 방식 선택(로컬 / Claude API)과 제작 방식 선택(A 텍스트→영상 / B 캡처 이미지→영상)",
  "장면 목록 확인",
  "장면별 대표 프레임 선택",
  "프롬프트 초안 편집 후 길이·비율·엔진을 정해 생성",
  "미리보기 탭: 원본 · 생성 · 나란히 비교",
] as const;

export default function BenchmarkPage() {
  return (
    <ComingSoon
      title="새로운 영상생성"
      description="참고할 유튜브 영상을 분석해 장면·프롬프트 초안을 만들고, 새 영상을 생성합니다."
      features={FEATURES}
    />
  );
}

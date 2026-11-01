import { redirect } from "next/navigation";

// 랜딩 없음: 시작 즉시 대시보드(AGENTS.md 1절).
export default function RootPage() {
  redirect("/dashboard");
}

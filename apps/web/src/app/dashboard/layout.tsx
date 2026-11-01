import type { ReactNode } from "react";
import { AppHeader } from "@/components/shell/app-header";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <AppHeader />
      <main className="flex-1 p-4 md:p-6 desktop:p-8">{children}</main>
    </div>
  );
}

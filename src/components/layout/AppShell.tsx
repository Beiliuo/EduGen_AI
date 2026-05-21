import { ModeBadge } from "@/components/layout/ModeBadge";
import { Sidebar } from "@/components/layout/Sidebar";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-border bg-white/90 px-4 py-3 backdrop-blur md:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-primary">EduGen AI</p>
              <p className="text-xs text-muted-foreground">面向教研场景的 AI 题目生成与质量评估平台</p>
            </div>
            <ModeBadge />
          </div>
        </header>
        <main className="px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils/cn";
import { BarChart3, BookOpenCheck, Home, PenLine, WandSparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "首页", icon: Home },
  { href: "/generate", label: "题目生成", icon: WandSparkles },
  { href: "/review", label: "题目审核", icon: BookOpenCheck },
  { href: "/prompts", label: "Prompt 模板", icon: PenLine },
  { href: "/dashboard", label: "数据看板", icon: BarChart3 }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-border bg-white lg:block">
      <div className="px-6 py-5">
        <div className="text-lg font-semibold">EduGen AI</div>
        <p className="mt-1 text-xs text-muted-foreground">AI 题目生成与质量评估平台</p>
      </div>
      <nav className="space-y-1 px-3">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted/70 hover:text-foreground",
                active && "bg-primary/10 text-primary"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

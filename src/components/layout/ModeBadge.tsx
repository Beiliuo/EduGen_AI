"use client";

import { Badge } from "@/components/ui/Badge";
import { useEffect, useState } from "react";

export function ModeBadge() {
  const [mode, setMode] = useState<"real" | "mock">("mock");

  useEffect(() => {
    fetch("/api/generate")
      .then((res) => res.json())
      .then((data) => setMode(data.mode === "real" ? "real" : "mock"))
      .catch(() => setMode("mock"));
  }, []);

  return <Badge className={mode === "real" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}>{mode === "real" ? "真实 AI 模式" : "Mock 演示模式"}</Badge>;
}

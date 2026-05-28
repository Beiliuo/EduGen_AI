"use client";

import { Badge } from "@/components/ui/Badge";
import { useEffect, useState } from "react";

type ApiStatus = {
  configured: boolean;
  model: string;
};

export function ModeBadge() {
  const [status, setStatus] = useState<ApiStatus>({ configured: false, model: "未配置" });

  useEffect(() => {
    fetch("/api/generate")
      .then((res) => res.json())
      .then((data) => setStatus({ configured: Boolean(data.configured), model: data.model ?? "未配置" }))
      .catch(() => setStatus({ configured: false, model: "配置检查失败" }));
  }, []);

  return (
    <Badge className={status.configured ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}>
      {status.configured ? `真实 AI：${status.model}` : "真实 AI 未配置"}
    </Badge>
  );
}

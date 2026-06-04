"use client";

import { Badge } from "@/components/ui/Badge";
import { getApiConfig } from "@/lib/data/localStore";
import type { ApiStatus } from "@/types/apiConfig";
import { useEffect, useState } from "react";

export function ModeBadge() {
  const [status, setStatus] = useState<ApiStatus>({
    configured: false,
    baseUrl: "",
    model: "未配置",
    source: "none"
  });

  useEffect(() => {
    async function loadStatus() {
      const localConfig = getApiConfig();
      if (localConfig?.apiKey?.trim()) {
        setStatus({
          configured: true,
          baseUrl: localConfig.baseUrl,
          model: localConfig.model,
          source: "page"
        });
        return;
      }

      try {
        const response = await fetch("/api/generate");
        const data = (await response.json()) as ApiStatus;
        setStatus({
          configured: Boolean(data.configured),
          baseUrl: data.baseUrl,
          model: data.model ?? "未配置",
          source: data.configured ? "env" : "none"
        });
      } catch {
        setStatus({ configured: false, baseUrl: "", model: "配置检查失败", source: "none" });
      }
    }

    loadStatus();
    window.addEventListener("edugen-ai-storage", loadStatus);
    window.addEventListener("storage", loadStatus);
    return () => {
      window.removeEventListener("edugen-ai-storage", loadStatus);
      window.removeEventListener("storage", loadStatus);
    };
  }, []);

  const configuredClass =
    status.source === "page" ? "border-sky-200 bg-sky-50 text-sky-700" : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return (
    <Badge className={status.configured ? configuredClass : "border-red-200 bg-red-50 text-red-700"}>
      {status.configured
        ? `${status.source === "page" ? "页面 API" : "环境变量 API"}：${status.model}`
        : "真实 AI 未配置"}
    </Badge>
  );
}

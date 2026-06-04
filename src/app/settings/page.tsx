"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";
import { useEduGenStore } from "@/lib/data/useEduGenStore";
import type { ApiConfig } from "@/types/apiConfig";
import { CheckCircle2, Eye, EyeOff, Loader2, PlugZap, Save, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

const defaultConfig: ApiConfig = {
  apiKey: "",
  baseUrl: "https://token-plan-cn.xiaomimimo.com/v1",
  model: "mimo-v2.5-pro"
};

export default function SettingsPage() {
  const { apiConfig, saveApiConfig, deleteApiConfig } = useEduGenStore();
  const [form, setForm] = useState<ApiConfig>(defaultConfig);
  const [showKey, setShowKey] = useState(false);
  const [message, setMessage] = useState("");
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (apiConfig) setForm({ ...defaultConfig, ...apiConfig });
  }, [apiConfig]);

  function update<K extends keyof ApiConfig>(key: K, value: ApiConfig[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onSave(event: FormEvent) {
    event.preventDefault();
    if (!form.apiKey.trim()) {
      setMessage("请先填写 API Key。");
      return;
    }
    saveApiConfig({
      apiKey: form.apiKey.trim(),
      baseUrl: form.baseUrl.trim() || defaultConfig.baseUrl,
      model: form.model.trim() || defaultConfig.model
    });
    setMessage("API 配置已保存，题目生成将优先使用页面配置。");
  }

  async function onTest() {
    setTesting(true);
    setMessage("");
    try {
      const response = await fetch("/api/test-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiConfig: {
            apiKey: form.apiKey.trim(),
            baseUrl: form.baseUrl.trim(),
            model: form.model.trim()
          }
        })
      });
      const data = (await response.json()) as { ok: boolean; message?: string };
      setMessage(data.message ?? (response.ok ? "API 连接成功" : "API 连接失败"));
    } catch {
      setMessage("API 连接失败，请检查网络、Base URL、模型名称和 Key。");
    } finally {
      setTesting(false);
    }
  }

  function onClear() {
    deleteApiConfig();
    setForm(defaultConfig);
    setMessage("页面 API 配置已清除。若 .env.local 已配置，系统仍会使用环境变量。");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API 配置</CardTitle>
          <CardDescription>
            配置兼容 OpenAI Chat Completions 格式的服务。保存后，题目生成会优先使用这里的 Key、Base URL 和模型。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSave}>
            <Field label="API Key">
              <div className="flex gap-2">
                <Input
                  type={showKey ? "text" : "password"}
                  value={form.apiKey}
                  autoComplete="off"
                  placeholder="输入你的 API Key"
                  onChange={(event) => update("apiKey", event.target.value)}
                />
                <Button type="button" variant="secondary" onClick={() => setShowKey((value) => !value)} aria-label="显示或隐藏 API Key">
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Base URL">
                <Input value={form.baseUrl} placeholder={defaultConfig.baseUrl} onChange={(event) => update("baseUrl", event.target.value)} />
              </Field>
              <Field label="模型名称">
                <Input value={form.model} placeholder={defaultConfig.model} onChange={(event) => update("model", event.target.value)} />
              </Field>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="submit">
                <Save className="h-4 w-4" />
                保存配置
              </Button>
              <Button type="button" variant="secondary" onClick={onTest} disabled={testing || !form.apiKey.trim()}>
                {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlugZap className="h-4 w-4" />}
                测试连接
              </Button>
              <Button type="button" variant="danger" onClick={onClear}>
                <Trash2 className="h-4 w-4" />
                清除配置
              </Button>
            </div>
          </form>
          {message ? (
            <div className="mt-4 flex items-start gap-2 rounded-md border border-border bg-muted/40 px-4 py-3 text-sm text-foreground">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
              <span>{message}</span>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>配置说明</CardTitle>
          <CardDescription>第一版为了方便本地演示，页面配置会保存在浏览器 LocalStorage。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>页面 API 配置不会写入项目文件，也不会提交到 GitHub；换浏览器或清除站点数据后需要重新填写。</p>
          <p>如果同时存在页面配置和 .env.local，系统会优先使用页面配置。</p>
          <p>请不要在公开视频、截图或共享浏览器环境中暴露真实 API Key。</p>
        </CardContent>
      </Card>
    </div>
  );
}

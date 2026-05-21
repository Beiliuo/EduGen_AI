"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Progress } from "@/components/ui/Progress";
import { useEduGenStore } from "@/lib/data/useEduGenStore";
import type { PromptTemplate } from "@/types/promptTemplate";
import { Copy, Plus, Save } from "lucide-react";
import { useMemo, useState } from "react";

function blankTemplate(): PromptTemplate {
  const now = new Date().toISOString();
  return {
    id: `tpl-${Date.now()}`,
    name: "新 Prompt 模板",
    version: "v1.0",
    scenario: "请描述适用场景",
    inputFields: ["subject", "grade", "knowledgePoint", "questionType", "difficulty"],
    outputFormat: "JSON",
    content: "请根据输入字段生成结构化题目，并严格返回 JSON。",
    isActive: true,
    usageCount: 0,
    averageScore: 0,
    approvalRate: 0,
    majorIssueTags: [],
    createdAt: now,
    updatedAt: now
  };
}

export default function PromptsPage() {
  const { templates, setTemplates, questions } = useEduGenStore();
  const [selectedId, setSelectedId] = useState("basic-v1");
  const selected = templates.find((item) => item.id === selectedId) ?? templates[0];

  const templateStats = useMemo(() => {
    return templates.map((template) => {
      const related = questions.filter((item) => item.promptTemplateId === template.id);
      const reviewed = related.filter((item) => item.reviewStatus !== "pending");
      const approved = related.filter((item) => item.reviewStatus === "approved");
      const avg = related.length ? Math.round(related.reduce((sum, item) => sum + item.qualityScore.totalScore, 0) / related.length) : template.averageScore;
      const approvalRate = reviewed.length ? Math.round((approved.length / reviewed.length) * 100) : Math.round(template.approvalRate * 100);
      return { id: template.id, avg, approvalRate, usageCount: related.length || template.usageCount };
    });
  }, [templates, questions]);

  function updateSelected(patch: Partial<PromptTemplate>) {
    if (!selected) return;
    const next = templates.map((item) => (item.id === selected.id ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item));
    setTemplates(next);
  }

  function addTemplate() {
    const item = blankTemplate();
    setTemplates([item, ...templates]);
    setSelectedId(item.id);
  }

  function copyTemplate() {
    if (!selected) return;
    const versionNumber = Number(selected.version.replace(/[^\d.]/g, "")) || 1;
    const now = new Date().toISOString();
    const copy = {
      ...selected,
      id: `${selected.id}-copy-${Date.now()}`,
      version: `v${(versionNumber + 0.1).toFixed(1)}`,
      usageCount: 0,
      averageScore: 0,
      approvalRate: 0,
      majorIssueTags: [],
      createdAt: now,
      updatedAt: now
    };
    setTemplates([copy, ...templates]);
    setSelectedId(copy.id);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Prompt 模板管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">展示 Prompt 版本、适用场景、输出约束和历史表现。</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={copyTemplate} disabled={!selected}><Copy className="h-4 w-4" />复制为新版本</Button>
          <Button onClick={addTemplate}><Plus className="h-4 w-4" />新建模板</Button>
        </div>
      </div>

      <section className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>模板列表</CardTitle>
            <CardDescription>{templates.length} 个模板</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {templates.map((template) => {
              const stats = templateStats.find((item) => item.id === template.id);
              return (
                <button
                  key={template.id}
                  className={`w-full rounded-md border p-4 text-left transition hover:border-primary ${selected?.id === template.id ? "border-primary bg-primary/5" : "border-border bg-white"}`}
                  onClick={() => setSelectedId(template.id)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{template.name}</p>
                    <Badge className={template.isActive ? "border-emerald-200 bg-emerald-50 text-emerald-700" : ""}>{template.isActive ? "启用" : "停用"}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{template.version} · 使用 {stats?.usageCount ?? template.usageCount} 次</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <span>平均分 {stats?.avg ?? template.averageScore}</span>
                    <span>通过率 {stats?.approvalRate ?? Math.round(template.approvalRate * 100)}%</span>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>模板详情</CardTitle>
              <CardDescription>第一版使用本地数据保存，结构可迁移到数据库。</CardDescription>
            </CardHeader>
            <CardContent>
              {!selected ? (
                <div className="rounded-md border border-dashed border-border p-10 text-center text-sm text-muted-foreground">暂无模板。</div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="模板名称"><Input value={selected.name} onChange={(e) => updateSelected({ name: e.target.value })} /></Field>
                    <Field label="模板版本"><Input value={selected.version} onChange={(e) => updateSelected({ version: e.target.value })} /></Field>
                  </div>
                  <Field label="适用场景"><Input value={selected.scenario} onChange={(e) => updateSelected({ scenario: e.target.value })} /></Field>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="输入字段"><Input value={selected.inputFields.join(", ")} onChange={(e) => updateSelected({ inputFields: e.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} /></Field>
                    <Field label="启用状态">
                      <Select value={selected.isActive ? "启用" : "停用"} onChange={(e) => updateSelected({ isActive: e.target.value === "启用" })}>
                        <option>启用</option>
                        <option>停用</option>
                      </Select>
                    </Field>
                  </div>
                  <Field label="输出格式要求"><Input value={selected.outputFormat} readOnly /></Field>
                  <Field label="Prompt 内容"><Textarea value={selected.content} className="min-h-48" onChange={(e) => updateSelected({ content: e.target.value })} /></Field>
                  <Button onClick={() => updateSelected({ updatedAt: new Date().toISOString() })}><Save className="h-4 w-4" />保存模板</Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>模板效果对比</CardTitle>
              <CardDescription>结合本地生成题目与审核结果计算表现。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {templates.map((template) => {
                const stats = templateStats.find((item) => item.id === template.id);
                const avg = stats?.avg ?? template.averageScore;
                const rate = stats?.approvalRate ?? Math.round(template.approvalRate * 100);
                return (
                  <div key={template.id} className="rounded-md border border-border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">{template.name} {template.version}</p>
                        <p className="mt-1 text-xs text-muted-foreground">主要问题：{template.majorIssueTags.join("、") || "暂无"}</p>
                      </div>
                      <Badge>平均分 {avg}</Badge>
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-[120px_1fr_80px] md:items-center">
                      <span className="text-xs text-muted-foreground">审核通过率</span>
                      <Progress value={rate} />
                      <span className="text-sm font-medium">{rate}%</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

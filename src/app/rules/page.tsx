"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { issueTags } from "@/lib/data/constants";
import { useEduGenStore } from "@/lib/data/useEduGenStore";
import type { QualityRule } from "@/types/qualityRule";
import { BookMarked, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

type Filters = {
  issueTag: "all" | string;
  keyword: string;
};

function blankRule(): QualityRule {
  const now = new Date().toISOString();
  return {
    id: `rule-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    name: "新题目质量规则",
    scenario: "通用教研审核场景",
    knowledgePoint: "",
    issueTags: [],
    ruleDescription: "请描述该类题目的质量判断标准。",
    improvementSuggestion: "请描述可执行的生成或审核优化建议。",
    occurrenceCount: 1,
    createdAt: now,
    updatedAt: now
  };
}

export default function RulesPage() {
  const { qualityRules, questions, saveQualityRule, deleteQualityRule } = useEduGenStore();
  const [selectedId, setSelectedId] = useState("");
  const [filters, setFilters] = useState<Filters>({ issueTag: "all", keyword: "" });
  const selected = qualityRules.find((item) => item.id === selectedId) ?? qualityRules[0];

  const filteredRules = useMemo(() => {
    return qualityRules.filter((rule) => {
      const tagMatch = filters.issueTag === "all" || rule.issueTags.includes(filters.issueTag);
      const keywordMatch =
        !filters.keyword ||
        rule.name.includes(filters.keyword) ||
        rule.knowledgePoint.includes(filters.keyword) ||
        rule.ruleDescription.includes(filters.keyword);
      return tagMatch && keywordMatch;
    });
  }, [qualityRules, filters]);

  const highFrequencyIssues = useMemo(() => {
    const record = new Map<string, number>();
    questions.forEach((question) => {
      question.issueTags.forEach((tag) => record.set(tag, (record.get(tag) ?? 0) + 1));
    });
    return Array.from(record.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [questions]);

  function updateSelected(patch: Partial<QualityRule>) {
    if (!selected) return;
    saveQualityRule({ ...selected, ...patch, updatedAt: new Date().toISOString() });
  }

  function toggleTag(tag: string) {
    if (!selected) return;
    const tags = selected.issueTags.includes(tag) ? selected.issueTags.filter((item) => item !== tag) : [...selected.issueTags, tag];
    updateSelected({ issueTags: tags });
  }

  function createRule() {
    const rule = blankRule();
    saveQualityRule(rule);
    setSelectedId(rule.id);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">质量规则库</h1>
          <p className="mt-1 text-sm text-muted-foreground">把教师审核经验沉淀为可复用的题目质量规则与教研知识。</p>
        </div>
        <Button onClick={createRule}>
          <Plus className="h-4 w-4" />
          新建规则
        </Button>
      </div>

      <section className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>规则筛选</CardTitle>
              <CardDescription>按问题标签和关键词查看沉淀规则。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="问题标签">
                <Select value={filters.issueTag} onChange={(event) => setFilters((prev) => ({ ...prev, issueTag: event.target.value }))}>
                  <option value="all">全部</option>
                  {issueTags.map((tag) => <option key={tag}>{tag}</option>)}
                </Select>
              </Field>
              <Field label="关键词">
                <Input value={filters.keyword} onChange={(event) => setFilters((prev) => ({ ...prev, keyword: event.target.value }))} placeholder="规则名 / 知识点 / 说明" />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>高频问题摘要</CardTitle>
              <CardDescription>基于当前审核题目的问题标签自动汇总。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {!highFrequencyIssues.length ? <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">暂无审核问题标签。</div> : null}
              {highFrequencyIssues.map(([tag, count]) => (
                <div key={tag} className="flex items-center justify-between rounded-md border border-border p-3">
                  <span className="text-sm font-medium">{tag}</span>
                  <Badge>{count} 次</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>规则列表</CardTitle>
              <CardDescription>{filteredRules.length} 条规则</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {!filteredRules.length ? <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">暂无规则。</div> : null}
              {filteredRules.map((rule) => (
                <button key={rule.id} className={`w-full rounded-md border p-3 text-left ${selected?.id === rule.id ? "border-primary bg-primary/5" : "border-border bg-white"}`} onClick={() => setSelectedId(rule.id)}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">{rule.name}</span>
                    <Badge>{rule.occurrenceCount} 次</Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{rule.scenario}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {rule.issueTags.slice(0, 3).map((tag) => <Badge key={tag}>{tag}</Badge>)}
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>规则详情</CardTitle>
            <CardDescription>规则可继续编辑，用于作品集中展示“经验沉淀”的产品能力。</CardDescription>
          </CardHeader>
          <CardContent>
            {!selected ? (
              <div className="rounded-md border border-dashed border-border p-12 text-center text-sm text-muted-foreground">暂无规则，请先从审核页沉淀规则或新建规则。</div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="规则名称"><Input value={selected.name} onChange={(event) => updateSelected({ name: event.target.value })} /></Field>
                  <Field label="适用场景"><Input value={selected.scenario} onChange={(event) => updateSelected({ scenario: event.target.value })} /></Field>
                </div>
                <Field label="关联知识点"><Input value={selected.knowledgePoint} onChange={(event) => updateSelected({ knowledgePoint: event.target.value })} /></Field>
                <div>
                  <p className="mb-3 text-sm font-medium">关联问题标签</p>
                  <div className="flex flex-wrap gap-2">
                    {issueTags.map((tag) => (
                      <button key={tag} onClick={() => toggleTag(tag)} className={`rounded-full border px-3 py-1.5 text-xs font-medium ${selected.issueTags.includes(tag) ? "border-primary bg-primary text-white" : "border-border bg-muted/40 text-muted-foreground"}`}>
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                <Field label="规则说明"><Textarea className="min-h-32" value={selected.ruleDescription} onChange={(event) => updateSelected({ ruleDescription: event.target.value })} /></Field>
                <Field label="改进建议"><Textarea className="min-h-32" value={selected.improvementSuggestion} onChange={(event) => updateSelected({ improvementSuggestion: event.target.value })} /></Field>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => updateSelected({ occurrenceCount: selected.occurrenceCount + 1 })}>
                    <BookMarked className="h-4 w-4" />
                    记录一次复现
                  </Button>
                  <Button variant="danger" onClick={() => deleteQualityRule(selected.id)}>
                    <Trash2 className="h-4 w-4" />
                    删除规则
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

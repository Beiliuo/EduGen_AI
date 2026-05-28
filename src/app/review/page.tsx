"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Progress } from "@/components/ui/Progress";
import { difficulties, issueTags, questionTypes, reviewStatusLabels } from "@/lib/data/constants";
import { useEduGenStore } from "@/lib/data/useEduGenStore";
import type { QualityRule } from "@/types/qualityRule";
import type { Difficulty, Question, ReviewStatus } from "@/types/question";
import { BookMarked, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type Filters = {
  status: "all" | ReviewStatus;
  questionType: "all" | Question["questionType"];
  knowledgePoint: string;
  issueTag: "all" | string;
};

function makeRuleId() {
  return `rule-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export default function ReviewPage() {
  const { questions, qualityRules, setQuestions, saveQualityRule, deleteQuestion } = useEduGenStore();
  const [selectedId, setSelectedId] = useState("");
  const [filters, setFilters] = useState<Filters>({ status: "all", questionType: "all", knowledgePoint: "", issueTag: "all" });
  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const filtered = useMemo(() => {
    return questions.filter((item) => {
      const statusMatch = filters.status === "all" || item.reviewStatus === filters.status;
      const typeMatch = filters.questionType === "all" || item.questionType === filters.questionType;
      const kpMatch = !filters.knowledgePoint || item.knowledgePoint.includes(filters.knowledgePoint);
      const tagMatch = filters.issueTag === "all" || item.issueTags.includes(filters.issueTag);
      return statusMatch && typeMatch && kpMatch && tagMatch;
    });
  }, [questions, filters]);

  const selected = questions.find((item) => item.id === selectedId) ?? filtered[0] ?? questions[0];

  function patchSelected(patch: Partial<Question>, message = "") {
    if (!selected) return;
    const next = questions.map((item) => (item.id === selected.id ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item));
    setQuestions(next);
    setSuccessMessage(message);
  }

  function toggleTag(tag: string) {
    if (!selected) return;
    const tags = selected.issueTags.includes(tag) ? selected.issueTags.filter((item) => item !== tag) : [...selected.issueTags, tag];
    patchSelected({ issueTags: tags });
  }

  function updateOptions(value: string) {
    patchSelected({ options: value.split("\n").map((item) => item.trim()).filter(Boolean) });
  }

  function saveAsRule() {
    if (!selected) return;
    const now = new Date().toISOString();
    const keyTags = selected.issueTags.length ? selected.issueTags : ["人工审核建议"];
    const existing = qualityRules.find((rule) => rule.knowledgePoint === selected.knowledgePoint && keyTags.every((tag) => rule.issueTags.includes(tag)));
    const rule: QualityRule = {
      id: existing?.id ?? makeRuleId(),
      name: `${selected.knowledgePoint}题目质量规则`,
      scenario: `${selected.grade} · ${selected.subject} · ${selected.questionType}`,
      knowledgePoint: selected.knowledgePoint,
      issueTags: keyTags,
      ruleDescription: selected.reviewComment || selected.qualityScore.summary || "来自人工审核过程的题目质量判断。",
      improvementSuggestion: selected.reviewSuggestion || selected.qualityScore.suggestion || "建议在生成 Prompt 中补充明确约束，并在审核时持续观察。",
      sourceQuestionId: selected.id,
      occurrenceCount: existing ? existing.occurrenceCount + 1 : 1,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now
    };
    saveQualityRule(rule);
    patchSelected({ shouldOptimizePrompt: true }, "已沉淀为质量规则");
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteQuestion(deleteTarget.id);
    if (selectedId === deleteTarget.id) setSelectedId("");
    setDeleteTarget(null);
    setSuccessMessage("题目已删除");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[430px_1fr]">
      <div className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>审核筛选</CardTitle>
            <CardDescription>按状态、题型、知识点和问题标签定位待处理题目。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <Field label="审核状态">
              <Select value={filters.status} onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value as Filters["status"] }))}>
                <option value="all">全部</option>
                {Object.entries(reviewStatusLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </Select>
            </Field>
            <Field label="题型">
              <Select value={filters.questionType} onChange={(event) => setFilters((prev) => ({ ...prev, questionType: event.target.value as Filters["questionType"] }))}>
                <option value="all">全部</option>
                {questionTypes.map((item) => <option key={item}>{item}</option>)}
              </Select>
            </Field>
            <Field label="知识点">
              <Input value={filters.knowledgePoint} onChange={(event) => setFilters((prev) => ({ ...prev, knowledgePoint: event.target.value }))} placeholder="输入关键词" />
            </Field>
            <Field label="问题标签">
              <Select value={filters.issueTag} onChange={(event) => setFilters((prev) => ({ ...prev, issueTag: event.target.value }))}>
                <option value="all">全部</option>
                {issueTags.map((item) => <option key={item}>{item}</option>)}
              </Select>
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>题目列表</CardTitle>
            <CardDescription>{filtered.length} 道题目</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {successMessage ? <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{successMessage}</div> : null}
            {!filtered.length ? <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">暂无题目</div> : null}
            {filtered.map((question) => (
              <div key={question.id} className={`rounded-md border p-3 transition hover:border-primary ${selected?.id === question.id ? "border-primary bg-primary/5" : "border-border bg-white"}`}>
                <button className="w-full text-left" onClick={() => setSelectedId(question.id)}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="line-clamp-1 text-sm font-medium">{question.stem}</span>
                    <Badge>{reviewStatusLabels[question.reviewStatus]}</Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge>{question.questionType}</Badge>
                    <Badge>{question.knowledgePoint}</Badge>
                    <Badge>{question.qualityScore.totalScore} 分</Badge>
                  </div>
                </button>
                <div className="mt-3 flex flex-wrap justify-end gap-2">
                  <Link href={`/questions/${question.id}`}><Button variant="secondary" size="sm">查看详情</Button></Link>
                  <Button variant="secondary" size="sm" onClick={() => setSelectedId(question.id)}>去审核</Button>
                  <Button variant="danger" size="sm" onClick={() => setDeleteTarget(question)}><Trash2 className="h-4 w-4" />删除</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>人工审核与经验沉淀</CardTitle>
          <CardDescription>审核结论、题目修订和问题规则会沉淀为可复用的教研质量经验。</CardDescription>
        </CardHeader>
        <CardContent>
          {!selected ? (
            <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
              暂无题目，请先进入题目生成页创建题目。
              <div className="mt-4"><Link href="/generate"><Button variant="secondary">去生成题目</Button></Link></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="mb-3 flex flex-wrap gap-2">
                  <Badge>{selected.subject}</Badge>
                  <Badge>{selected.grade}</Badge>
                  <Badge>{selected.questionType}</Badge>
                  <Badge>{selected.difficulty}</Badge>
                  {selected.reviewSuggestion ? <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">人工修订</Badge> : null}
                </div>
                <h2 className="text-lg font-semibold leading-7">{selected.stem}</h2>
                <div className="mt-3 grid gap-3 md:grid-cols-[160px_1fr] md:items-center">
                  <span className="text-sm font-medium">AI 质量分 {selected.qualityScore.totalScore}</span>
                  <Progress value={selected.qualityScore.totalScore} />
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <Field label="审核状态">
                  <Select value={selected.reviewStatus} onChange={(event) => patchSelected({ reviewStatus: event.target.value as ReviewStatus })}>
                    <option value="approved">通过</option>
                    <option value="needs_revision">需修改</option>
                    <option value="rejected">不通过</option>
                    <option value="pending">待审核</option>
                  </Select>
                </Field>
                <Field label="是否建议优化 Prompt">
                  <Select value={selected.shouldOptimizePrompt ? "是" : "否"} onChange={(event) => patchSelected({ shouldOptimizePrompt: event.target.value === "是" })}>
                    <option>否</option>
                    <option>是</option>
                  </Select>
                </Field>
              </div>

              <div>
                <p className="mb-3 text-sm font-medium">问题标签</p>
                <div className="flex flex-wrap gap-2">
                  {issueTags.map((tag) => (
                    <button key={tag} onClick={() => toggleTag(tag)} className={`rounded-full border px-3 py-1.5 text-xs font-medium ${selected.issueTags.includes(tag) ? "border-primary bg-primary text-white" : "border-border bg-muted/40 text-muted-foreground"}`}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <Field label="知识点"><Input value={selected.knowledgePoint} onChange={(event) => patchSelected({ knowledgePoint: event.target.value })} /></Field>
                <Field label="难度">
                  <Select value={selected.difficulty} onChange={(event) => patchSelected({ difficulty: event.target.value as Difficulty })}>
                    {difficulties.map((item) => <option key={item}>{item}</option>)}
                  </Select>
                </Field>
              </div>
              <Field label="题干"><Textarea value={selected.stem} onChange={(event) => patchSelected({ stem: event.target.value })} /></Field>
              <Field label="选项（每行一个）"><Textarea value={selected.options.join("\n")} onChange={(event) => updateOptions(event.target.value)} /></Field>
              <Field label="标准答案"><Textarea value={selected.answer} onChange={(event) => patchSelected({ answer: event.target.value })} /></Field>
              <Field label="答案解析"><Textarea value={selected.explanation} onChange={(event) => patchSelected({ explanation: event.target.value })} /></Field>
              <Field label="人工修改建议"><Textarea value={selected.reviewSuggestion ?? ""} onChange={(event) => patchSelected({ reviewSuggestion: event.target.value })} placeholder="例如：补充实验条件，增强选项干扰性。" /></Field>
              <Field label="审核备注"><Textarea value={selected.reviewComment} onChange={(event) => patchSelected({ reviewComment: event.target.value })} placeholder="记录审核判断依据。" /></Field>

              <div className="flex flex-wrap gap-2">
                <Button onClick={() => patchSelected({ reviewStatus: "approved", issueTags: [] }, "已标记通过")}><Save className="h-4 w-4" />标记通过</Button>
                <Button variant="secondary" onClick={() => patchSelected({ reviewStatus: "needs_revision" }, "已标记需修改")}>标记需修改</Button>
                <Button variant="secondary" onClick={() => patchSelected({ reviewStatus: "rejected" }, "已标记不通过")}>标记不通过</Button>
                <Button variant="secondary" onClick={saveAsRule}><BookMarked className="h-4 w-4" />沉淀为规则</Button>
                <Link href={`/questions/${selected.id}`}><Button variant="ghost">查看详情</Button></Link>
                <Button variant="danger" onClick={() => setDeleteTarget(selected)}><Trash2 className="h-4 w-4" />删除</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="确认删除该题目？"
        description="删除后，该题目将从题目列表、审核记录和数据统计中移除。此操作不可撤销。"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

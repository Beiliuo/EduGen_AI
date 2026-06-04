"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/ui/Field";
import { Progress } from "@/components/ui/Progress";
import { difficulties, grades, knowledgePointExamples, questionTypes, subjects } from "@/lib/data/constants";
import { upsertQuestions } from "@/lib/data/localStore";
import { useEduGenStore } from "@/lib/data/useEduGenStore";
import type { GenerateQuestionInput, GenerateQuestionResult, Question } from "@/types/question";
import { ArrowRight, Loader2, Settings, WandSparkles } from "lucide-react";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

export default function GeneratePage() {
  const { templates, apiConfig } = useEduGenStore();
  const activeTemplates = useMemo(() => templates.filter((item) => item.isActive), [templates]);
  const [result, setResult] = useState<Question[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<GenerateQuestionInput>({
    subject: subjects[0],
    grade: grades[1] ?? grades[0],
    knowledgePoint: knowledgePointExamples[0],
    questionType: questionTypes[0],
    difficulty: difficulties[1] ?? difficulties[0],
    count: 2,
    withExplanation: true,
    promptTemplateId: "basic-v1",
    promptTemplateName: "基础题目生成模板"
  });

  function update<K extends keyof GenerateQuestionInput>(key: K, value: GenerateQuestionInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onTemplateChange(id: string) {
    const template = templates.find((item) => item.id === id);
    update("promptTemplateId", id);
    update("promptTemplateName", template?.name ?? "基础题目生成模板");
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setResult([]);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: form,
          apiConfig: apiConfig?.apiKey?.trim() ? apiConfig : undefined
        })
      });
      const data = (await response.json()) as GenerateQuestionResult;

      if (!response.ok) {
        setMessage(data.message ?? "真实 AI 生成失败，请检查 API Key、Base URL 和模型名称。");
        return;
      }

      setResult(data.questions);
      if (data.questions.length) upsertQuestions(data.questions);
      setMessage(data.message ?? "已使用真实 AI API 生成题目。");
    } catch {
      setMessage("真实 AI 生成失败，请检查网络、API Key、Base URL 和模型名称。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>题目生成工作台</CardTitle>
          <CardDescription>按教研条件调用真实 AI API 生成题目，并自动触发质量评分。</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="学科">
                <Select value={form.subject} onChange={(e) => update("subject", e.target.value as GenerateQuestionInput["subject"])}>
                  {subjects.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </Select>
              </Field>
              <Field label="年级">
                <Select value={form.grade} onChange={(e) => update("grade", e.target.value as GenerateQuestionInput["grade"])}>
                  {grades.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="知识点">
              <Input list="knowledge-points" value={form.knowledgePoint} onChange={(e) => update("knowledgePoint", e.target.value)} />
              <datalist id="knowledge-points">
                {knowledgePointExamples.map((item) => (
                  <option value={item} key={item} />
                ))}
              </datalist>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="题型">
                <Select value={form.questionType} onChange={(e) => update("questionType", e.target.value as GenerateQuestionInput["questionType"])}>
                  {questionTypes.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </Select>
              </Field>
              <Field label="难度">
                <Select value={form.difficulty} onChange={(e) => update("difficulty", e.target.value as GenerateQuestionInput["difficulty"])}>
                  {difficulties.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="生成数量">
                <Input type="number" min={1} max={5} value={form.count} onChange={(e) => update("count", Number(e.target.value))} />
              </Field>
              <Field label="是否生成解析">
                <Select value={form.withExplanation ? "是" : "否"} onChange={(e) => update("withExplanation", e.target.value === "是")}>
                  <option>是</option>
                  <option>否</option>
                </Select>
              </Field>
            </div>
            <Field label="Prompt 模板">
              <Select value={form.promptTemplateId} onChange={(e) => onTemplateChange(e.target.value)}>
                {activeTemplates.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} {item.version}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
              当前生成会优先使用页面 API 配置；未配置页面 Key 时，将尝试使用 .env.local 中的环境变量。
              <Link className="ml-1 font-medium text-primary" href="/settings">
                去配置
              </Link>
            </div>
            <Button className="w-full" disabled={loading || !form.knowledgePoint.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />}
              调用真实 AI 生成题目
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {message ? <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{message}</div> : null}
        <Card>
          <CardHeader>
            <CardTitle>生成结果</CardTitle>
            <CardDescription>生成成功后会保存到本地题库，供审核、规则沉淀、组卷和看板使用。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!result.length && !loading ? (
              <div className="space-y-3 rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                <div>请先配置真实 API Key，然后填写左侧条件生成题目。</div>
                <Link href="/settings">
                  <Button type="button" variant="secondary">
                    <Settings className="h-4 w-4" />
                    打开 API 配置
                  </Button>
                </Link>
              </div>
            ) : null}
            {loading ? (
              <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                真实 AI 正在生成并评分...
              </div>
            ) : null}
            {result.map((question) => (
              <div key={question.id} className="rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{question.subject}</Badge>
                  <Badge>{question.grade}</Badge>
                  <Badge>{question.questionType}</Badge>
                  <Badge>{question.difficulty}</Badge>
                </div>
                <h3 className="mt-3 text-base font-semibold">{question.stem}</h3>
                {question.options.length ? (
                  <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                    {question.options.map((option) => (
                      <li key={option}>{option}</li>
                    ))}
                  </ul>
                ) : null}
                <div className="mt-4 grid gap-3 md:grid-cols-[140px_1fr_auto] md:items-center">
                  <div className="text-sm font-medium">质量分 {question.qualityScore.totalScore}</div>
                  <Progress value={question.qualityScore.totalScore} />
                  <Link href={`/questions/${question.id}`}>
                    <Button variant="secondary" size="sm">
                      查看详情 <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

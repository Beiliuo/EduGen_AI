"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Field, Textarea } from "@/components/ui/Field";
import { useEduGenStore } from "@/lib/data/useEduGenStore";
import type { Paper } from "@/types/paper";
import type { Question } from "@/types/question";
import { ArrowLeft, Printer, Save } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

function updateSnapshot(question: Question, patch: Partial<Question>) {
  return { ...question, ...patch, updatedAt: new Date().toISOString() };
}

export default function PaperDetailPage() {
  const params = useParams<{ id: string }>();
  const { papers, ready, savePaper } = useEduGenStore();
  const storedPaper = papers.find((item) => item.id === params.id);
  const [draftQuestions, setDraftQuestions] = useState<Question[] | null>(null);
  const paperQuestions = draftQuestions ?? storedPaper?.questionSnapshots ?? [];

  const paper = useMemo<Paper | undefined>(() => {
    if (!storedPaper) return undefined;
    return { ...storedPaper, questionSnapshots: paperQuestions, questionIds: paperQuestions.map((item) => item.id), totalScore: paperQuestions.length * 10 };
  }, [paperQuestions, storedPaper]);

  function patchQuestion(index: number, patch: Partial<Question>) {
    setDraftQuestions((current) => {
      const base = current ?? storedPaper?.questionSnapshots ?? [];
      return base.map((question, itemIndex) => (itemIndex === index ? updateSnapshot(question, patch) : question));
    });
  }

  function updateOptions(index: number, value: string) {
    patchQuestion(index, { options: value.split("\n").map((item) => item.trim()).filter(Boolean) });
  }

  function saveSnapshots() {
    if (!paper) return;
    savePaper({ ...paper, updatedAt: new Date().toISOString() });
    setDraftQuestions(null);
  }

  if (!ready) return <div className="text-sm text-muted-foreground">加载试卷中...</div>;

  if (!paper) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-sm text-muted-foreground">未找到该试卷，可能已被删除。</p>
          <Link href="/papers" className="mt-4 inline-block"><Button variant="secondary">返回组卷中心</Button></Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">试卷详情</h1>
          <p className="mt-1 text-sm text-muted-foreground">可编辑试卷专属题目快照，并通过浏览器打印另存为 PDF。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/papers"><Button variant="secondary"><ArrowLeft className="h-4 w-4" />返回组卷中心</Button></Link>
          <Button variant="secondary" onClick={saveSnapshots}><Save className="h-4 w-4" />保存快照修改</Button>
          <Button onClick={() => window.print()}><Printer className="h-4 w-4" />打印 / 另存 PDF</Button>
        </div>
      </div>

      <section className="print-paper rounded-lg border border-border bg-white p-8 shadow-soft">
        <header className="border-b border-border pb-6 text-center">
          <h2 className="text-3xl font-semibold">{paper.title}</h2>
          <p className="mt-3 text-sm text-muted-foreground">{paper.description}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Badge>{paper.subject}</Badge>
            <Badge>{paper.grade}</Badge>
            <Badge>{paper.teachingScenario ?? "课堂练习"}</Badge>
            <Badge>{paper.studentLevel ?? "标准班级"}</Badge>
            <Badge>{paper.durationMinutes} 分钟</Badge>
            <Badge>总分 {paper.totalScore} 分</Badge>
            <Badge>{paper.questionSnapshots.length} 题</Badge>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">练习目标：{paper.learningGoal ?? "巩固核心知识点，检查学生掌握情况。"}</p>
        </header>

        <main className="mt-8 space-y-8">
          <section>
            <h3 className="mb-4 text-lg font-semibold">一、试题</h3>
            <div className="space-y-6">
              {paper.questionSnapshots.map((question, index) => (
                <article key={`${question.id}-${index}`} className="break-inside-avoid rounded-md border border-border p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{question.questionType}</Badge>
                    <Badge>{question.difficulty}</Badge>
                    <Badge>{question.knowledgePoint}</Badge>
                    <Badge>10 分</Badge>
                  </div>
                  <p className="mt-3 font-medium leading-7">{index + 1}. {question.stem}</p>
                  {question.options.length ? (
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                      {question.options.map((option) => <li key={option}>{option}</li>)}
                    </ul>
                  ) : (
                    <div className="mt-5 h-16 rounded-md border border-dashed border-border" />
                  )}

                  <div className="no-print mt-5 space-y-3 rounded-md bg-muted/30 p-4">
                    <p className="text-sm font-semibold">试卷专属编辑</p>
                    <Field label="题干"><Textarea value={question.stem} onChange={(event) => patchQuestion(index, { stem: event.target.value })} /></Field>
                    <Field label="选项（每行一个）"><Textarea value={question.options.join("\n")} onChange={(event) => updateOptions(index, event.target.value)} /></Field>
                    <Field label="答案"><Textarea value={question.answer} onChange={(event) => patchQuestion(index, { answer: event.target.value })} /></Field>
                    <Field label="解析"><Textarea value={question.explanation} onChange={(event) => patchQuestion(index, { explanation: event.target.value })} /></Field>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="break-before-page">
            <h3 className="mb-4 text-lg font-semibold">二、答案与解析</h3>
            <div className="space-y-5">
              {paper.questionSnapshots.map((question, index) => (
                <article key={`${question.id}-answer-${index}`} className="break-inside-avoid rounded-md border border-border p-5">
                  <p className="font-medium">{index + 1}. 答案：{question.answer}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">解析：{question.explanation || "暂无解析。"}</p>
                  <p className="mt-2 text-xs text-muted-foreground">AI 质量分：{question.qualityScore.totalScore}</p>
                </article>
              ))}
            </div>
          </section>
        </main>
      </section>
    </div>
  );
}

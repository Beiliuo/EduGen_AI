"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Progress } from "@/components/ui/Progress";
import { reviewStatusLabels } from "@/lib/data/constants";
import { useEduGenStore } from "@/lib/data/useEduGenStore";
import { ArrowLeft, ClipboardCheck, RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

const scoreFields = [
  ["knowledgeMatchScore", "知识点匹配度"],
  ["difficultyScore", "难度一致性"],
  ["answerCorrectnessScore", "答案正确性"],
  ["explanationScore", "解析完整度"],
  ["clarityScore", "表述清晰度"]
] as const;

export default function QuestionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { questions, ready, deleteQuestion } = useEduGenStore();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const question = questions.find((item) => item.id === params.id);

  function confirmDelete() {
    if (!question) return;
    deleteQuestion(question.id);
    setDeleteOpen(false);
    window.alert("题目已删除");
    router.push("/review");
  }

  if (!ready) return <div className="text-sm text-muted-foreground">加载题目中...</div>;
  if (!question) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-sm text-muted-foreground">未找到该题目，可能已被删除或本地数据已清空。</p>
          <Link href="/review" className="mt-4 inline-block">
            <Button variant="secondary">返回审核页</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">题目详情</h1>
          <p className="mt-1 text-sm text-muted-foreground">查看题目内容、AI 质量评分和后续审核入口。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/review">
            <Button>
              <ClipboardCheck className="h-4 w-4" />
              去审核
            </Button>
          </Link>
          <Link href="/generate">
            <Button variant="secondary">
              <RotateCcw className="h-4 w-4" />
              重新生成
            </Button>
          </Link>
          <Link href="/generate">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4" />
              返回生成页
            </Button>
          </Link>
          <Button variant="danger" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" />
            删除题目
          </Button>
        </div>
      </div>

      <section className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>生成条件与流转状态</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["学科", question.subject],
                ["年级", question.grade],
                ["知识点", question.knowledgePoint],
                ["题型", question.questionType],
                ["难度", question.difficulty],
                ["Prompt 模板", question.promptTemplateName],
                ["生成时间", new Date(question.createdAt).toLocaleString("zh-CN")],
                ["审核状态", reviewStatusLabels[question.reviewStatus]]
              ].map(([label, value]) => (
                <div key={label} className="rounded-md bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-1 text-sm font-medium">{value}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>题目内容</CardTitle>
              <CardDescription>题干、答案与解析</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="text-sm font-semibold">题干</p>
                <p className="mt-2 leading-7">{question.stem}</p>
              </div>
              {question.options.length ? (
                <div>
                  <p className="text-sm font-semibold">选项</p>
                  <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                    {question.options.map((option) => (
                      <li key={option}>{option}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-md border border-border p-4">
                  <p className="text-sm font-semibold">标准答案</p>
                  <p className="mt-2 text-sm text-muted-foreground">{question.answer}</p>
                </div>
                <div className="rounded-md border border-border p-4">
                  <p className="text-sm font-semibold">答案解析</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{question.explanation || "本题未生成解析。"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>AI 质量评分</CardTitle>
              <CardDescription>总分 0-100 分</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-semibold text-primary">{question.qualityScore.totalScore}</div>
              <div className="mt-4">
                <Progress value={question.qualityScore.totalScore} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>评分维度</CardTitle>
              <CardDescription>每项满分 20 分</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {scoreFields.map(([key, label]) => (
                <div key={key}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>{label}</span>
                    <span className="font-medium">{question.qualityScore[key]}</span>
                  </div>
                  <Progress value={question.qualityScore[key]} max={20} />
                </div>
              ))}
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span>题目可用性</span>
                  <span className="font-medium">{Math.round(question.qualityScore.totalScore / 5)}</span>
                </div>
                <Progress value={Math.round(question.qualityScore.totalScore / 5)} max={20} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>AI 评估建议</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>{question.qualityScore.summary}</p>
              <p>{question.qualityScore.suggestion}</p>
              <div className="flex flex-wrap gap-2">
                {question.issueTags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <ConfirmDialog
        open={deleteOpen}
        title="确认删除该题目？"
        description="删除后，该题目将从题目列表、审核记录和数据统计中移除。此操作不可撤销。"
        onCancel={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

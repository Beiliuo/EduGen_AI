"use client";

import { DashboardCharts } from "@/components/charts/DashboardCharts";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { calculateDashboardMetrics } from "@/lib/data/metrics";
import { useEduGenStore } from "@/lib/data/useEduGenStore";
import { Activity, AlertTriangle, BarChart3, CheckCircle2, Gauge } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { questions, templates } = useEduGenStore();
  const metrics = calculateDashboardMetrics(questions, templates);
  const bestTemplate = metrics.templateRows.slice().sort((a, b) => b.score - a.score)[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">数据看板</h1>
          <p className="mt-1 text-sm text-muted-foreground">追踪 AI 题目生产质量、人工审核结果和 Prompt 版本表现。</p>
        </div>
        <Link href="/generate"><Button>继续生成题目</Button></Link>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="总生成题目数" value={metrics.total} helper="包含样例和新生成题目" icon={<Activity className="h-5 w-5" />} />
        <MetricCard label="已审核题目数" value={metrics.reviewed} helper="非待审核状态" icon={<CheckCircle2 className="h-5 w-5" />} />
        <MetricCard label="审核通过率" value={`${metrics.approvalRate}%`} helper="通过 / 已审核" icon={<Gauge className="h-5 w-5" />} />
        <MetricCard label="平均 AI 质量分" value={metrics.avgScore || "-"} helper="五维评分总分均值" icon={<BarChart3 className="h-5 w-5" />} />
      </section>

      <DashboardCharts questions={questions} templates={templates} />

      <section className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader>
            <CardTitle>问题标签分布</CardTitle>
            <CardDescription>用于定位 Prompt 与生成规则优化方向。</CardDescription>
          </CardHeader>
          <CardContent>
            {!metrics.issueRows.length ? (
              <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">暂无问题标签，完成审核后会自动出现。</div>
            ) : (
              <div className="space-y-3">
                {metrics.issueRows.sort((a, b) => Number(b.value) - Number(a.value)).map((row) => (
                  <div key={String(row.name)} className="flex items-center justify-between rounded-md border border-border p-3">
                    <span className="text-sm font-medium">{String(row.name)}</span>
                    <Badge>{String(row.value)} 次</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>产品洞察</CardTitle>
            <CardDescription>面试展示时可用的指标解读。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
            <div className="rounded-md bg-muted/40 p-4">
              <p className="font-medium text-foreground">通过率最高方向</p>
              <p className="mt-1">当前样例中基础概念题通过率更稳定，适合作为首批题库生产场景。</p>
            </div>
            <div className="rounded-md bg-muted/40 p-4">
              <p className="font-medium text-foreground">高频问题</p>
              <p className="mt-1">主要问题标签为「{metrics.topIssue}」，可反向推动 Prompt 增加约束。</p>
            </div>
            <div className="rounded-md bg-muted/40 p-4">
              <p className="font-medium text-foreground">最佳模板</p>
              <p className="mt-1">{bestTemplate?.name ?? "暂无模板数据"} 当前平均质量分最高。</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>低质量题目列表</CardTitle>
          <CardDescription>AI 质量分低于 80 分的题目需要优先人工复核。</CardDescription>
        </CardHeader>
        <CardContent>
          {!metrics.lowQuality.length ? (
            <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">暂无低质量题目。</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-border text-xs text-muted-foreground">
                  <tr>
                    <th className="py-3">题目</th>
                    <th className="py-3">知识点</th>
                    <th className="py-3">题型</th>
                    <th className="py-3">质量分</th>
                    <th className="py-3">审核状态</th>
                    <th className="py-3">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.lowQuality.map((question) => (
                    <tr key={question.id} className="border-b border-border last:border-b-0">
                      <td className="max-w-[360px] py-3"><span className="line-clamp-1">{question.stem}</span></td>
                      <td className="py-3">{question.knowledgePoint}</td>
                      <td className="py-3">{question.questionType}</td>
                      <td className="py-3 text-amber-700"><AlertTriangle className="mr-1 inline h-4 w-4" />{question.qualityScore.totalScore}</td>
                      <td className="py-3">{question.reviewStatus}</td>
                      <td className="py-3"><Link href={`/questions/${question.id}`}><Button variant="secondary" size="sm">查看</Button></Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { calculateDashboardMetrics } from "@/lib/data/metrics";
import { useEduGenStore } from "@/lib/data/useEduGenStore";
import { Activity, Gauge, Tags, WandSparkles } from "lucide-react";
import Link from "next/link";

const flow = ["题目生成", "AI 质量评估", "人工审核", "问题归因", "Prompt 优化"];

export default function HomePage() {
  const { questions, templates } = useEduGenStore();
  const metrics = calculateDashboardMetrics(questions, templates);

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-lg border border-border bg-white p-8 shadow-soft">
          <p className="text-sm font-semibold text-primary">AI 教育产品作品集 Demo</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal text-foreground">EduGen AI</h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">面向教研场景的 AI 题目生成与质量评估平台</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/generate"><Button><WandSparkles className="h-4 w-4" />开始生成题目</Button></Link>
            <Link href="/dashboard"><Button variant="secondary">查看数据看板</Button></Link>
            <Link href="/prompts"><Button variant="secondary">管理 Prompt 模板</Button></Link>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>产品闭环</CardTitle>
            <CardDescription>从 AIGC 生产到人工反馈沉淀</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {flow.map((item, index) => (
              <div key={item} className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">{index + 1}</span>
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="生成题目数" value={metrics.total} helper="本地演示数据实时统计" icon={<Activity className="h-5 w-5" />} />
        <MetricCard label="审核通过率" value={`${metrics.approvalRate}%`} helper="通过 / 已审核题目" icon={<Gauge className="h-5 w-5" />} />
        <MetricCard label="平均质量分" value={metrics.avgScore || "-"} helper="AI 五维评分均值" icon={<WandSparkles className="h-5 w-5" />} />
        <MetricCard label="主要问题标签" value={metrics.topIssue} helper="人工审核沉淀问题" icon={<Tags className="h-5 w-5" />} />
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {[
          ["需求拆解", "围绕教研题目生产场景，拆解生成、评估、审核、归因和 Prompt 迭代链路。"],
          ["质量评估", "用知识点匹配、难度一致性、答案正确性、解析完整度、表述清晰度构建可解释评分。"],
          ["指标意识", "通过通过率、问题标签分布、模板效果对比等指标支撑 AI 产品迭代决策。"]
        ].map(([title, desc]) => (
          <Card key={title}>
            <CardContent>
              <h3 className="text-base font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{desc}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}

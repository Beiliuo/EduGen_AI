"use client";

import type { Question } from "@/types/question";
import type { PromptTemplate } from "@/types/promptTemplate";
import { calculateDashboardMetrics } from "@/lib/data/metrics";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const colors = ["#0f766e", "#f59e0b", "#2563eb", "#dc2626", "#7c3aed", "#16a34a"];

export function DashboardCharts({ questions, templates }: { questions: Question[]; templates: PromptTemplate[] }) {
  const metrics = calculateDashboardMetrics(questions, templates);
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <div className="rounded-lg border border-border bg-white p-5 shadow-soft">
        <h3 className="mb-4 text-sm font-semibold">各题型生成数量</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics.typeRows}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" name="数量" fill="#0f766e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-white p-5 shadow-soft">
        <h3 className="mb-4 text-sm font-semibold">各难度生成分布</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={metrics.difficultyRows} dataKey="value" nameKey="name" outerRadius={95} label>
                {metrics.difficultyRows.map((_, index) => (
                  <Cell key={index} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-white p-5 shadow-soft">
        <h3 className="mb-4 text-sm font-semibold">最近 7 天生成趋势</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics.trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" name="生成数量" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-white p-5 shadow-soft">
        <h3 className="mb-4 text-sm font-semibold">Prompt 模板效果对比</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics.templateRows}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" hide />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="score" name="平均质量分" fill="#0f766e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="approvalRate" name="通过率" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

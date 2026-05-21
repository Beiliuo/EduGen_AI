import { defaultPromptTemplates } from "@/lib/data/promptTemplates";
import type { PromptTemplate } from "@/types/promptTemplate";
import type { Question } from "@/types/question";

export function percent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100);
}

export function average(values: number[]) {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export function countBy<T extends string>(items: T[]) {
  return items.reduce<Record<T, number>>((acc, item) => {
    acc[item] = (acc[item] ?? 0) + 1;
    return acc;
  }, {} as Record<T, number>);
}

export function toChartRows(record: Record<string, number>, name = "name", value = "value") {
  return Object.entries(record).map(([key, count]) => ({ [name]: key, [value]: count }));
}

export function calculateDashboardMetrics(questions: Question[], templates: PromptTemplate[] = defaultPromptTemplates) {
  const reviewed = questions.filter((item) => item.reviewStatus !== "pending");
  const approved = questions.filter((item) => item.reviewStatus === "approved");
  const issueTagRecord = countBy(questions.flatMap((item) => item.issueTags));
  const avgScore = average(questions.map((item) => item.qualityScore.totalScore));

  const templateRows = templates.map((template) => {
    const related = questions.filter((item) => item.promptTemplateId === template.id);
    const relatedReviewed = related.filter((item) => item.reviewStatus !== "pending");
    const relatedApproved = related.filter((item) => item.reviewStatus === "approved");
    return {
      name: `${template.name} ${template.version}`,
      score: related.length ? average(related.map((item) => item.qualityScore.totalScore)) : template.averageScore,
      approvalRate: relatedReviewed.length ? percent(relatedApproved.length / relatedReviewed.length) : percent(template.approvalRate)
    };
  });

  const trend = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = date.toISOString().slice(5, 10);
    const count = questions.filter((item) => item.createdAt.slice(5, 10) === key).length;
    return { date: key, count };
  });

  return {
    total: questions.length,
    reviewed: reviewed.length,
    approvalRate: reviewed.length ? percent(approved.length / reviewed.length) : 0,
    avgScore,
    typeRows: toChartRows(countBy(questions.map((item) => item.questionType))),
    difficultyRows: toChartRows(countBy(questions.map((item) => item.difficulty))),
    issueRows: toChartRows(issueTagRecord),
    templateRows,
    trend,
    lowQuality: questions.filter((item) => item.qualityScore.totalScore < 80).slice(0, 6),
    topIssue: Object.entries(issueTagRecord).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "暂无问题标签"
  };
}

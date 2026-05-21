import type { Difficulty, Grade, QuestionType, Subject } from "@/types/question";

export const subjects: Subject[] = ["科学", "数学", "物理", "生物"];
export const grades: Grade[] = ["小学", "初中", "高中"];
export const questionTypes: QuestionType[] = ["单选题", "判断题", "简答题", "实验探究题"];
export const difficulties: Difficulty[] = ["简单", "中等", "困难"];

export const knowledgePointExamples = ["浮力", "光的反射", "细胞结构", "一元一次方程", "牛顿第一定律"];

export const issueTags = [
  "知识点错误",
  "答案错误",
  "解析不完整",
  "难度过高",
  "难度过低",
  "题型不符合",
  "表述不清",
  "不适合目标年级",
  "选项干扰性不足",
  "缺少真实教学场景"
];

export const reviewStatusLabels = {
  pending: "待审核",
  approved: "通过",
  needs_revision: "需修改",
  rejected: "不通过"
} as const;

import type { PromptTemplate } from "@/types/promptTemplate";

const now = "2026-05-14T00:00:00.000Z";

export const defaultPromptTemplates: PromptTemplate[] = [
  {
    id: "basic-v1",
    name: "基础题目生成模板",
    version: "v1.0",
    scenario: "适用于常规知识点练习题生成，强调题干清晰、答案唯一。",
    inputFields: ["subject", "grade", "knowledgePoint", "questionType", "difficulty"],
    outputFormat: "JSON",
    content:
      "你是一名 K12 教育教研专家。请根据学科、年级、知识点、题型和难度生成高质量题目，要求答案唯一、表述清晰，并严格输出 JSON。",
    isActive: true,
    usageCount: 42,
    averageScore: 84,
    approvalRate: 0.72,
    majorIssueTags: ["选项干扰性不足", "解析不完整"],
    createdAt: now,
    updatedAt: now
  },
  {
    id: "explanation-v1",
    name: "高质量解析模板",
    version: "v1.0",
    scenario: "适用于需要完整解题过程和关键概念解释的题目生成。",
    inputFields: ["subject", "grade", "knowledgePoint", "questionType", "difficulty"],
    outputFormat: "JSON",
    content:
      "请生成题目、标准答案和分步解析。解析需要说明核心概念、易错点和解题依据，避免只给结论。",
    isActive: true,
    usageCount: 31,
    averageScore: 89,
    approvalRate: 0.8,
    majorIssueTags: ["难度过高"],
    createdAt: now,
    updatedAt: now
  },
  {
    id: "experiment-v1",
    name: "实验探究题模板",
    version: "v1.0",
    scenario: "适用于科学、物理、生物等实验探究题，强调真实教学情境和变量控制。",
    inputFields: ["subject", "grade", "knowledgePoint", "questionType", "difficulty"],
    outputFormat: "JSON",
    content:
      "请围绕真实课堂实验场景生成探究题，包含实验目的、条件、观察现象、问题和标准答案，解析需说明变量控制。",
    isActive: true,
    usageCount: 18,
    averageScore: 82,
    approvalRate: 0.67,
    majorIssueTags: ["缺少真实教学场景", "表述不清"],
    createdAt: now,
    updatedAt: now
  },
  {
    id: "difficulty-v1",
    name: "难度控制模板",
    version: "v1.0",
    scenario: "适用于对难度一致性要求较高的批量生成任务。",
    inputFields: ["subject", "grade", "knowledgePoint", "questionType", "difficulty"],
    outputFormat: "JSON",
    content:
      "请严格控制题目难度。简单题考查概念识别，中等题考查迁移应用，困难题考查综合分析，并说明难度依据。",
    isActive: true,
    usageCount: 24,
    averageScore: 86,
    approvalRate: 0.76,
    majorIssueTags: ["难度过高", "难度过低"],
    createdAt: now,
    updatedAt: now
  }
];

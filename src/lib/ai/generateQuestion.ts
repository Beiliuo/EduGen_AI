import { buildEvaluatePrompt, buildGeneratePrompt } from "@/lib/ai/prompts";
import { mockGenerateQuestion } from "@/lib/ai/mockAI";
import type { GenerateQuestionInput, GenerateQuestionResult, Question, QualityScore } from "@/types/question";

type ModelQuestion = {
  stem: string;
  options?: string[];
  answer: string;
  explanation?: string;
  knowledgePoint?: string;
  difficulty?: string;
};

const baseUrl = process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";
const model = process.env.AI_MODEL ?? "gpt-4o-mini";

function extractJson(text: string) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

async function callOpenAI(prompt: string) {
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4
    })
  });

  if (!response.ok) {
    throw new Error(`AI API 请求失败：${response.status}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI API 未返回内容");
  return content as string;
}

async function evaluateWithOpenAI(question: Pick<Question, "stem" | "options" | "answer" | "explanation" | "knowledgePoint" | "difficulty">): Promise<QualityScore> {
  const content = await callOpenAI(buildEvaluatePrompt(question));
  const score = extractJson(content) as QualityScore;
  const totalScore =
    score.totalScore ??
    score.knowledgeMatchScore + score.difficultyScore + score.answerCorrectnessScore + score.explanationScore + score.clarityScore;
  return { ...score, totalScore };
}

export async function generateQuestion(input: GenerateQuestionInput): Promise<GenerateQuestionResult> {
  if (!process.env.OPENAI_API_KEY) {
    return { questions: mockGenerateQuestion(input), mode: "mock", message: "未配置 OPENAI_API_KEY，已使用 Mock 演示模式。" };
  }

  try {
    const content = await callOpenAI(buildGeneratePrompt(input));
    const parsed = extractJson(content);
    const rows = (Array.isArray(parsed) ? parsed : [parsed]) as ModelQuestion[];
    const questions: Question[] = [];

    for (let index = 0; index < Math.min(rows.length, input.count); index += 1) {
      const row = rows[index];
      const createdAt = new Date().toISOString();
      const partial = {
        stem: row.stem,
        options: row.options ?? [],
        answer: row.answer,
        explanation: row.explanation ?? "",
        knowledgePoint: row.knowledgePoint ?? input.knowledgePoint,
        difficulty: input.difficulty
      };
      const qualityScore = await evaluateWithOpenAI(partial);
      questions.push({
        id: `q-${Date.now()}-${index}`,
        subject: input.subject,
        grade: input.grade,
        knowledgePoint: partial.knowledgePoint,
        questionType: input.questionType,
        difficulty: input.difficulty,
        stem: partial.stem,
        options: partial.options,
        answer: partial.answer,
        explanation: partial.explanation,
        promptTemplateId: input.promptTemplateId,
        promptTemplateName: input.promptTemplateName,
        qualityScore,
        reviewStatus: "pending",
        issueTags: [],
        reviewComment: "",
        createdAt,
        updatedAt: createdAt
      });
    }

    return { questions, mode: "real", message: "已使用真实 AI 模式生成题目。" };
  } catch (error) {
    return {
      questions: mockGenerateQuestion(input),
      mode: "mock",
      message: error instanceof Error ? `真实 AI 调用失败，已 fallback 到 Mock：${error.message}` : "真实 AI 调用失败，已 fallback 到 Mock。"
    };
  }
}

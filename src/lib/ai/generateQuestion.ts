import { buildEvaluatePrompt, buildGeneratePrompt } from "@/lib/ai/prompts";
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

function requireApiKey() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("未配置 OPENAI_API_KEY。请先复制 .env.example 为 .env.local，并填写真实 API Key。");
  }
}

function extractJson(text: string) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

async function callOpenAI(prompt: string) {
  requireApiKey();

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
    const errorText = await response.text().catch(() => "");
    throw new Error(`AI API 请求失败：${response.status}${errorText ? ` - ${errorText.slice(0, 300)}` : ""}`);
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

  return { questions, mode: "real", message: "已使用真实 AI API 生成题目。" };
}

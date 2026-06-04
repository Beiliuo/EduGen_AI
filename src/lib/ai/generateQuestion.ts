import { buildEvaluatePrompt, buildGeneratePrompt } from "@/lib/ai/prompts";
import type { ApiConfig } from "@/types/apiConfig";
import type { GenerateQuestionInput, GenerateQuestionResult, Question, QualityScore } from "@/types/question";

type RuntimeApiConfig = Partial<Pick<ApiConfig, "apiKey" | "baseUrl" | "model">>;

type ModelQuestion = {
  stem: string;
  options?: string[];
  answer: string;
  explanation?: string;
  knowledgePoint?: string;
  difficulty?: string;
};

function resolveApiConfig(config?: RuntimeApiConfig) {
  return {
    apiKey: config?.apiKey?.trim() || process.env.OPENAI_API_KEY || "",
    baseUrl: config?.baseUrl?.trim() || process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
    model: config?.model?.trim() || process.env.AI_MODEL || "gpt-4o-mini"
  };
}

function requireApiKey(config?: RuntimeApiConfig) {
  const resolved = resolveApiConfig(config);
  if (!resolved.apiKey) {
    throw new Error("未配置 API Key。请先在「API 配置」页面填写 Key，或在 .env.local 中配置 OPENAI_API_KEY。");
  }
  return resolved;
}

function extractJson(text: string) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

async function callOpenAI(prompt: string, config?: RuntimeApiConfig) {
  const resolved = requireApiKey(config);

  const response = await fetch(`${resolved.baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${resolved.apiKey}`
    },
    body: JSON.stringify({
      model: resolved.model,
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

async function evaluateWithOpenAI(
  question: Pick<Question, "stem" | "options" | "answer" | "explanation" | "knowledgePoint" | "difficulty">,
  config?: RuntimeApiConfig
): Promise<QualityScore> {
  const content = await callOpenAI(buildEvaluatePrompt(question), config);
  const score = extractJson(content) as QualityScore;
  const totalScore =
    score.totalScore ??
    score.knowledgeMatchScore + score.difficultyScore + score.answerCorrectnessScore + score.explanationScore + score.clarityScore;
  return { ...score, totalScore };
}

export async function testAIConnection(config?: RuntimeApiConfig) {
  const resolved = requireApiKey(config);
  await callOpenAI('请只返回 JSON：{"ok":true}', resolved);
  return { ok: true, baseUrl: resolved.baseUrl, model: resolved.model };
}

export async function generateQuestion(input: GenerateQuestionInput, config?: RuntimeApiConfig): Promise<GenerateQuestionResult> {
  const resolved = requireApiKey(config);
  const content = await callOpenAI(buildGeneratePrompt(input), resolved);
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
    const qualityScore = await evaluateWithOpenAI(partial, resolved);
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

import type { GenerateQuestionInput, Question } from "@/types/question";

export function buildGeneratePrompt(input: GenerateQuestionInput) {
  return `你是一名 K12 教育教研专家，请根据用户提供的学科、年级、知识点、题型和难度生成高质量题目。

要求：
1. 符合目标年级学生认知水平。
2. 答案唯一，解析清晰，避免模糊表述。
3. 如果是单选题，请提供 4 个选项；如果不是单选题，options 可以为空数组，判断题可提供 ["正确", "错误"]。
4. 严格输出 JSON 数组，不要输出 Markdown、解释文字或代码块。

输入：
- 学科：${input.subject}
- 年级：${input.grade}
- 知识点：${input.knowledgePoint}
- 题型：${input.questionType}
- 难度：${input.difficulty}
- 数量：${input.count}
- 是否生成解析：${input.withExplanation ? "是" : "否"}
- Prompt 模板：${input.promptTemplateName}

每道题输出字段：
{
  "stem": "题干",
  "options": ["A. ...", "B. ..."],
  "answer": "标准答案",
  "explanation": "答案解析",
  "knowledgePoint": "考察知识点",
  "difficulty": "难度",
  "reason": "出题设计理由"
}`;
}

export function buildEvaluatePrompt(question: Pick<Question, "stem" | "options" | "answer" | "explanation" | "knowledgePoint" | "difficulty">) {
  return `请作为 AI 教育内容质量评估专家，对以下题目进行评分。

评分维度每项 0-20 分：
1. knowledgeMatchScore：知识点匹配度
2. difficultyScore：难度一致性
3. answerCorrectnessScore：答案正确性
4. explanationScore：解析完整度
5. clarityScore：表述清晰度

请严格输出 JSON，不要输出 Markdown、解释文字或代码块：
{
  "knowledgeMatchScore": number,
  "difficultyScore": number,
  "answerCorrectnessScore": number,
  "explanationScore": number,
  "clarityScore": number,
  "totalScore": number,
  "summary": "string",
  "suggestion": "string"
}

题目：
${JSON.stringify(question, null, 2)}`;
}

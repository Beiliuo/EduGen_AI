import type { GenerateQuestionInput, Question, QualityScore } from "@/types/question";

function makeId(index: number) {
  return `q-${Date.now()}-${index}-${Math.random().toString(16).slice(2, 8)}`;
}

function clampScore(value: number) {
  return Math.max(10, Math.min(20, Math.round(value)));
}

export function mockEvaluateQuestion(input: GenerateQuestionInput, index = 0): QualityScore {
  const templateBoost = input.promptTemplateId.includes("explanation") ? 2 : input.promptTemplateId.includes("experiment") ? -1 : 0;
  const difficultyAdjust = input.difficulty === "困难" ? -2 : input.difficulty === "简单" ? 1 : 0;
  const typeAdjust = input.questionType === "实验探究题" ? -1 : input.questionType === "判断题" ? 1 : 0;
  const seed = (input.knowledgePoint.length + index * 3) % 4;

  const knowledgeMatchScore = clampScore(17 + templateBoost + seed * 0.4);
  const difficultyScore = clampScore(16 + difficultyAdjust + seed * 0.3);
  const answerCorrectnessScore = clampScore(18 + typeAdjust);
  const explanationScore = clampScore(input.withExplanation ? 16 + templateBoost + seed * 0.5 : 12);
  const clarityScore = clampScore(16 + typeAdjust + seed * 0.4);
  const totalScore = knowledgeMatchScore + difficultyScore + answerCorrectnessScore + explanationScore + clarityScore;

  return {
    totalScore,
    knowledgeMatchScore,
    difficultyScore,
    answerCorrectnessScore,
    explanationScore,
    clarityScore,
    summary: `题目整体围绕「${input.knowledgePoint}」展开，符合${input.grade}${input.subject}的常规教学要求。`,
    suggestion:
      totalScore >= 88
        ? "建议在批量生成时保持当前模板，并持续观察人工审核通过率。"
        : "建议增强真实教学情境、选项干扰性和解析中的关键概念说明。"
  };
}

function buildOptions(input: GenerateQuestionInput) {
  if (input.questionType === "判断题") return ["正确", "错误"];
  if (input.questionType !== "单选题") return [];
  return [
    `A. 只关注${input.knowledgePoint}的表面现象`,
    `B. 能正确解释${input.knowledgePoint}的核心规律`,
    "C. 与目标知识点无关",
    "D. 结论需要根据个人经验判断"
  ];
}

function buildStem(input: GenerateQuestionInput, index: number) {
  if (input.questionType === "实验探究题") {
    return `某${input.grade}学习小组围绕「${input.knowledgePoint}」设计实验，请根据实验现象判断变量关系，并说明结论依据。（第 ${index + 1} 题）`;
  }
  if (input.questionType === "简答题") {
    return `请结合一个课堂实例，说明「${input.knowledgePoint}」的核心含义及其在${input.subject}学习中的应用。（第 ${index + 1} 题）`;
  }
  if (input.questionType === "判断题") {
    return `在${input.subject}学习中，掌握「${input.knowledgePoint}」只需要记忆结论，不需要理解条件。`;
  }
  return `关于「${input.knowledgePoint}」的理解，下列哪一项最符合${input.grade}${input.subject}学习要求？（第 ${index + 1} 题）`;
}

export function mockGenerateQuestion(input: GenerateQuestionInput): Question[] {
  return Array.from({ length: input.count }, (_, index) => {
    const score = mockEvaluateQuestion(input, index);
    const createdAt = new Date().toISOString();
    const options = buildOptions(input);
    return {
      id: makeId(index),
      subject: input.subject,
      grade: input.grade,
      knowledgePoint: input.knowledgePoint,
      questionType: input.questionType,
      difficulty: input.difficulty,
      stem: buildStem(input, index),
      options,
      answer: input.questionType === "单选题" ? "B" : input.questionType === "判断题" ? "错误" : `应围绕${input.knowledgePoint}的定义、条件和应用场景作答。`,
      explanation: input.withExplanation
        ? `本题考查学生对「${input.knowledgePoint}」的理解。高质量作答需要说明概念条件、关键判断依据，并避免只背诵结论。`
        : "",
      promptTemplateId: input.promptTemplateId,
      promptTemplateName: input.promptTemplateName,
      qualityScore: score,
      reviewStatus: "pending",
      issueTags: [],
      reviewComment: "",
      createdAt,
      updatedAt: createdAt
    };
  });
}

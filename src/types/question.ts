export type Subject = "科学" | "数学" | "物理" | "生物";
export type Grade = "小学" | "初中" | "高中";
export type QuestionType = "单选题" | "判断题" | "简答题" | "实验探究题";
export type Difficulty = "简单" | "中等" | "困难";
export type ReviewStatus = "pending" | "approved" | "needs_revision" | "rejected";

export type QualityScore = {
  totalScore: number;
  knowledgeMatchScore: number;
  difficultyScore: number;
  answerCorrectnessScore: number;
  explanationScore: number;
  clarityScore: number;
  summary: string;
  suggestion: string;
};

export type Question = {
  id: string;
  subject: Subject;
  grade: Grade;
  knowledgePoint: string;
  questionType: QuestionType;
  difficulty: Difficulty;
  stem: string;
  options: string[];
  answer: string;
  explanation: string;
  promptTemplateId: string;
  promptTemplateName: string;
  qualityScore: QualityScore;
  reviewStatus: ReviewStatus;
  issueTags: string[];
  reviewComment: string;
  reviewSuggestion?: string;
  shouldOptimizePrompt?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GenerateQuestionInput = {
  subject: Subject;
  grade: Grade;
  knowledgePoint: string;
  questionType: QuestionType;
  difficulty: Difficulty;
  count: number;
  withExplanation: boolean;
  promptTemplateId: string;
  promptTemplateName: string;
};

export type GenerateQuestionResult = {
  questions: Question[];
  mode: "real";
  message?: string;
};

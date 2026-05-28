export type QualityRule = {
  id: string;
  name: string;
  scenario: string;
  knowledgePoint: string;
  issueTags: string[];
  ruleDescription: string;
  improvementSuggestion: string;
  sourceQuestionId?: string;
  occurrenceCount: number;
  createdAt: string;
  updatedAt: string;
};

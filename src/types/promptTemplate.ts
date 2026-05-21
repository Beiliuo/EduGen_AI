export type PromptTemplate = {
  id: string;
  name: string;
  version: string;
  scenario: string;
  inputFields: string[];
  outputFormat: "JSON";
  content: string;
  isActive: boolean;
  usageCount: number;
  averageScore: number;
  approvalRate: number;
  majorIssueTags: string[];
  createdAt: string;
  updatedAt: string;
};

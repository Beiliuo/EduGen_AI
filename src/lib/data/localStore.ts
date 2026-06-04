"use client";

import { defaultPromptTemplates } from "@/lib/data/promptTemplates";
import type { ApiConfig } from "@/types/apiConfig";
import type { Paper } from "@/types/paper";
import type { PromptTemplate } from "@/types/promptTemplate";
import type { QualityRule } from "@/types/qualityRule";
import type { Question } from "@/types/question";

const questionKey = "edugen-ai.questions";
const templateKey = "edugen-ai.promptTemplates";
const paperKey = "edugen-ai.papers";
const qualityRuleKey = "edugen-ai.qualityRules";
const apiConfigKey = "edugen-ai.apiConfig";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) {
    window.localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    window.localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event("edugen-ai-storage"));
}

export function getQuestions() {
  return read<Question[]>(questionKey, []);
}

export function saveQuestions(questions: Question[]) {
  write(questionKey, questions);
}

export function upsertQuestions(incoming: Question[]) {
  const current = getQuestions();
  saveQuestions([...incoming, ...current]);
}

export function updateQuestion(question: Question) {
  const next = getQuestions().map((item) => (item.id === question.id ? question : item));
  saveQuestions(next);
}

export function deleteQuestion(questionId: string) {
  const next = getQuestions().filter((item) => item.id !== questionId);
  saveQuestions(next);
}

export function getPapers() {
  return read<Paper[]>(paperKey, []);
}

export function savePapers(papers: Paper[]) {
  write(paperKey, papers);
}

export function upsertPaper(paper: Paper) {
  const current = getPapers();
  const exists = current.some((item) => item.id === paper.id);
  savePapers(exists ? current.map((item) => (item.id === paper.id ? paper : item)) : [paper, ...current]);
}

export function deletePaper(paperId: string) {
  const next = getPapers().filter((item) => item.id !== paperId);
  savePapers(next);
}

export function getQualityRules() {
  return read<QualityRule[]>(qualityRuleKey, []);
}

export function saveQualityRules(rules: QualityRule[]) {
  write(qualityRuleKey, rules);
}

export function upsertQualityRule(rule: QualityRule) {
  const current = getQualityRules();
  const exists = current.some((item) => item.id === rule.id);
  saveQualityRules(exists ? current.map((item) => (item.id === rule.id ? rule : item)) : [rule, ...current]);
}

export function deleteQualityRule(ruleId: string) {
  const next = getQualityRules().filter((item) => item.id !== ruleId);
  saveQualityRules(next);
}

export function getPromptTemplates() {
  return read<PromptTemplate[]>(templateKey, defaultPromptTemplates);
}

export function savePromptTemplates(templates: PromptTemplate[]) {
  write(templateKey, templates);
}

export function getApiConfig() {
  return read<ApiConfig | null>(apiConfigKey, null);
}

export function saveApiConfig(config: ApiConfig) {
  write(apiConfigKey, { ...config, updatedAt: new Date().toISOString() });
}

export function deleteApiConfig() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(apiConfigKey);
  window.dispatchEvent(new Event("edugen-ai-storage"));
}

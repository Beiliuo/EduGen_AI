"use client";

import { defaultPromptTemplates } from "@/lib/data/promptTemplates";
import { sampleQuestions } from "@/lib/data/sampleQuestions";
import type { Question } from "@/types/question";
import type { PromptTemplate } from "@/types/promptTemplate";

const questionKey = "edugen-ai.questions";
const templateKey = "edugen-ai.promptTemplates";

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
  return read<Question[]>(questionKey, sampleQuestions);
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

export function getPromptTemplates() {
  return read<PromptTemplate[]>(templateKey, defaultPromptTemplates);
}

export function savePromptTemplates(templates: PromptTemplate[]) {
  write(templateKey, templates);
}

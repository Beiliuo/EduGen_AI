"use client";

import {
  deleteApiConfig as deleteStoredApiConfig,
  deletePaper as deleteStoredPaper,
  deleteQualityRule as deleteStoredQualityRule,
  deleteQuestion as deleteStoredQuestion,
  getApiConfig,
  getPapers,
  getPromptTemplates,
  getQuestions,
  getQualityRules,
  saveApiConfig as saveStoredApiConfig,
  savePapers,
  savePromptTemplates,
  saveQualityRules,
  saveQuestions,
  upsertPaper as upsertStoredPaper,
  upsertQualityRule as upsertStoredQualityRule
} from "@/lib/data/localStore";
import type { ApiConfig } from "@/types/apiConfig";
import type { Paper } from "@/types/paper";
import type { PromptTemplate } from "@/types/promptTemplate";
import type { QualityRule } from "@/types/qualityRule";
import type { Question } from "@/types/question";
import { useCallback, useEffect, useState } from "react";

export function useEduGenStore() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [qualityRules, setQualityRules] = useState<QualityRule[]>([]);
  const [apiConfig, setApiConfig] = useState<ApiConfig | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setQuestions(getQuestions());
    setTemplates(getPromptTemplates());
    setPapers(getPapers());
    setQualityRules(getQualityRules());
    setApiConfig(getApiConfig());
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("edugen-ai-storage", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("edugen-ai-storage", refresh);
    };
  }, [refresh]);

  const persistQuestions = useCallback((next: Question[]) => {
    saveQuestions(next);
    setQuestions(next);
  }, []);

  const persistTemplates = useCallback((next: PromptTemplate[]) => {
    savePromptTemplates(next);
    setTemplates(next);
  }, []);

  const persistPapers = useCallback((next: Paper[]) => {
    savePapers(next);
    setPapers(next);
  }, []);

  const persistQualityRules = useCallback((next: QualityRule[]) => {
    saveQualityRules(next);
    setQualityRules(next);
  }, []);

  const savePaper = useCallback((paper: Paper) => {
    upsertStoredPaper(paper);
    setPapers(getPapers());
  }, []);

  const deletePaper = useCallback((paperId: string) => {
    deleteStoredPaper(paperId);
    setPapers((current) => current.filter((item) => item.id !== paperId));
  }, []);

  const saveQualityRule = useCallback((rule: QualityRule) => {
    upsertStoredQualityRule(rule);
    setQualityRules(getQualityRules());
  }, []);

  const deleteQualityRule = useCallback((ruleId: string) => {
    deleteStoredQualityRule(ruleId);
    setQualityRules((current) => current.filter((item) => item.id !== ruleId));
  }, []);

  const deleteQuestion = useCallback((questionId: string) => {
    deleteStoredQuestion(questionId);
    setQuestions((current) => current.filter((item) => item.id !== questionId));
  }, []);

  const saveApiConfig = useCallback((config: ApiConfig) => {
    saveStoredApiConfig(config);
    setApiConfig(getApiConfig());
  }, []);

  const deleteApiConfig = useCallback(() => {
    deleteStoredApiConfig();
    setApiConfig(null);
  }, []);

  return {
    questions,
    templates,
    papers,
    qualityRules,
    apiConfig,
    ready,
    setQuestions: persistQuestions,
    setTemplates: persistTemplates,
    setPapers: persistPapers,
    setQualityRules: persistQualityRules,
    savePaper,
    deletePaper,
    saveQualityRule,
    deleteQualityRule,
    deleteQuestion,
    saveApiConfig,
    deleteApiConfig,
    refresh
  };
}

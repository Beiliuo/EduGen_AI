"use client";

import { deleteQuestion as deleteStoredQuestion, getPromptTemplates, getQuestions, savePromptTemplates, saveQuestions } from "@/lib/data/localStore";
import type { PromptTemplate } from "@/types/promptTemplate";
import type { Question } from "@/types/question";
import { useCallback, useEffect, useState } from "react";

export function useEduGenStore() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setQuestions(getQuestions());
    setTemplates(getPromptTemplates());
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

  const deleteQuestion = useCallback((questionId: string) => {
    deleteStoredQuestion(questionId);
    setQuestions((current) => current.filter((item) => item.id !== questionId));
  }, []);

  return { questions, templates, ready, setQuestions: persistQuestions, setTemplates: persistTemplates, deleteQuestion, refresh };
}

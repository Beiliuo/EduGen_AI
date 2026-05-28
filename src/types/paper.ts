import type { Grade, Question, Subject } from "@/types/question";

export type Paper = {
  id: string;
  title: string;
  subject: Subject;
  grade: Grade;
  teachingScenario: string;
  studentLevel: string;
  learningGoal: string;
  description: string;
  questionIds: string[];
  questionSnapshots: Question[];
  totalScore: number;
  durationMinutes: number;
  createdAt: string;
  updatedAt: string;
};

"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { difficulties, grades, questionTypes, subjects } from "@/lib/data/constants";
import { useEduGenStore } from "@/lib/data/useEduGenStore";
import type { Paper } from "@/types/paper";
import type { Difficulty, Grade, Question, QuestionType, Subject } from "@/types/question";
import { ArrowDown, ArrowUp, FileText, Plus, Save, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type Filters = {
  subject: "all" | Subject;
  grade: "all" | Grade;
  questionType: "all" | QuestionType;
  difficulty: "all" | Difficulty;
  knowledgePoint: string;
};

type AutoConfig = {
  count: number;
  knowledgePoint: string;
  questionType: "all" | QuestionType;
  difficulty: "all" | Difficulty;
  template: "基础巩固" | "标准练习" | "能力提升";
};

function createPaperId() {
  return `paper-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function rankForTemplate(question: Question, template: AutoConfig["template"]) {
  const score = question.qualityScore.totalScore;
  if (template === "基础巩固") return (question.difficulty === "简单" ? 30 : 0) + score;
  if (template === "能力提升") return (question.difficulty === "困难" ? 30 : question.difficulty === "中等" ? 12 : 0) + score;
  return (question.difficulty === "中等" ? 25 : 0) + score;
}

export default function PapersPage() {
  const { questions, papers, savePaper, deletePaper } = useEduGenStore();
  const approvedQuestions = useMemo(() => questions.filter((item) => item.reviewStatus === "approved"), [questions]);
  const [editingPaperId, setEditingPaperId] = useState<string | null>(null);
  const [title, setTitle] = useState("AI 教育练习试卷");
  const [subject, setSubject] = useState<Subject>(subjects[0]);
  const [grade, setGrade] = useState<Grade>(grades[1] ?? grades[0]);
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [teachingScenario, setTeachingScenario] = useState("课堂练习");
  const [studentLevel, setStudentLevel] = useState("标准班级");
  const [learningGoal, setLearningGoal] = useState("巩固核心知识点，检查学生对关键概念的掌握情况。");
  const [description, setDescription] = useState("本试卷由审核通过的 AI 生成题目组成，用于课堂练习或阶段测评。");
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [filters, setFilters] = useState<Filters>({ subject: "all", grade: "all", questionType: "all", difficulty: "all", knowledgePoint: "" });
  const [autoConfig, setAutoConfig] = useState<AutoConfig>({ count: 5, knowledgePoint: "", questionType: "all", difficulty: "all", template: "标准练习" });
  const [message, setMessage] = useState("");

  const filteredQuestions = useMemo(() => {
    return approvedQuestions.filter((item) => {
      const selected = selectedQuestions.some((question) => question.id === item.id);
      const subjectMatch = filters.subject === "all" || item.subject === filters.subject;
      const gradeMatch = filters.grade === "all" || item.grade === filters.grade;
      const typeMatch = filters.questionType === "all" || item.questionType === filters.questionType;
      const difficultyMatch = filters.difficulty === "all" || item.difficulty === filters.difficulty;
      const kpMatch = !filters.knowledgePoint || item.knowledgePoint.includes(filters.knowledgePoint);
      return !selected && subjectMatch && gradeMatch && typeMatch && difficultyMatch && kpMatch;
    });
  }, [approvedQuestions, filters, selectedQuestions]);

  function resetForm() {
    setEditingPaperId(null);
    setTitle("AI 教育练习试卷");
    setSubject(subjects[0]);
    setGrade(grades[1] ?? grades[0]);
    setDurationMinutes(45);
    setTeachingScenario("课堂练习");
    setStudentLevel("标准班级");
    setLearningGoal("巩固核心知识点，检查学生对关键概念的掌握情况。");
    setDescription("本试卷由审核通过的 AI 生成题目组成，用于课堂练习或阶段测评。");
    setSelectedQuestions([]);
    setMessage("");
  }

  function loadPaper(paper: Paper) {
    setEditingPaperId(paper.id);
    setTitle(paper.title);
    setSubject(paper.subject);
    setGrade(paper.grade);
    setDurationMinutes(paper.durationMinutes);
    setTeachingScenario(paper.teachingScenario ?? "课堂练习");
    setStudentLevel(paper.studentLevel ?? "标准班级");
    setLearningGoal(paper.learningGoal ?? "巩固核心知识点，检查学生对关键概念的掌握情况。");
    setDescription(paper.description);
    setSelectedQuestions(paper.questionSnapshots);
    setMessage("已载入试卷，可继续编辑后保存。");
  }

  function addQuestion(question: Question) {
    setSelectedQuestions((current) => [...current, question]);
    setMessage("");
  }

  function removeQuestion(questionId: string) {
    setSelectedQuestions((current) => current.filter((item) => item.id !== questionId));
  }

  function moveQuestion(index: number, direction: -1 | 1) {
    setSelectedQuestions((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function autoCompose() {
    const selectedIds = new Set(selectedQuestions.map((item) => item.id));
    const pool = approvedQuestions
      .filter((item) => !selectedIds.has(item.id))
      .filter((item) => !autoConfig.knowledgePoint || item.knowledgePoint.includes(autoConfig.knowledgePoint))
      .filter((item) => autoConfig.questionType === "all" || item.questionType === autoConfig.questionType)
      .filter((item) => autoConfig.difficulty === "all" || item.difficulty === autoConfig.difficulty)
      .sort((a, b) => rankForTemplate(b, autoConfig.template) - rankForTemplate(a, autoConfig.template));
    const picked = pool.slice(0, autoConfig.count);
    if (!picked.length) {
      setMessage("没有找到符合自动组卷条件的审核通过题目。");
      return;
    }
    setSelectedQuestions((current) => [...current, ...picked]);
    setMessage(`已自动加入 ${picked.length} 道题目。`);
  }

  function saveCurrentPaper() {
    if (!title.trim()) {
      setMessage("请先填写试卷标题。");
      return;
    }
    if (!selectedQuestions.length) {
      setMessage("请至少选择 1 道审核通过的题目。");
      return;
    }

    const now = new Date().toISOString();
    const current = editingPaperId ? papers.find((item) => item.id === editingPaperId) : undefined;
    const paper: Paper = {
      id: editingPaperId ?? createPaperId(),
      title: title.trim(),
      subject,
      grade,
      teachingScenario,
      studentLevel,
      learningGoal,
      description,
      questionIds: selectedQuestions.map((item) => item.id),
      questionSnapshots: selectedQuestions,
      totalScore: selectedQuestions.length * 10,
      durationMinutes,
      createdAt: current?.createdAt ?? now,
      updatedAt: now
    };

    savePaper(paper);
    setEditingPaperId(paper.id);
    setMessage("试卷已保存");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">组卷中心</h1>
          <p className="mt-1 text-sm text-muted-foreground">从审核通过的题目中人工选题或规则匹配组卷，生成可保存和打印的个性化试卷。</p>
        </div>
        <Button variant="secondary" onClick={resetForm}><Plus className="h-4 w-4" />新建试卷</Button>
      </div>

      {message ? <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{message}</div> : null}

      <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>试卷信息</CardTitle>
              <CardDescription>每道题默认 10 分，保存时会记录题目快照。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="试卷标题"><Input value={title} onChange={(event) => setTitle(event.target.value)} /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="学科">
                  <Select value={subject} onChange={(event) => setSubject(event.target.value as Subject)}>{subjects.map((item) => <option key={item}>{item}</option>)}</Select>
                </Field>
                <Field label="年级">
                  <Select value={grade} onChange={(event) => setGrade(event.target.value as Grade)}>{grades.map((item) => <option key={item}>{item}</option>)}</Select>
                </Field>
              </div>
              <Field label="考试时长（分钟）"><Input type="number" min={10} max={180} value={durationMinutes} onChange={(event) => setDurationMinutes(Number(event.target.value))} /></Field>
              <Field label="教学场景"><Input value={teachingScenario} onChange={(event) => setTeachingScenario(event.target.value)} placeholder="课堂练习 / 课后测验 / 阶段检测" /></Field>
              <Field label="学生层次"><Input value={studentLevel} onChange={(event) => setStudentLevel(event.target.value)} placeholder="基础薄弱 / 标准班级 / 提升训练" /></Field>
              <Field label="练习目标"><Textarea value={learningGoal} onChange={(event) => setLearningGoal(event.target.value)} /></Field>
              <Field label="试卷说明"><Textarea value={description} onChange={(event) => setDescription(event.target.value)} /></Field>
              <Button className="w-full" onClick={saveCurrentPaper}><Save className="h-4 w-4" />保存试卷</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>已保存试卷</CardTitle>
              <CardDescription>{papers.length} 张试卷</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {!papers.length ? <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">暂无已保存试卷。</div> : null}
              {papers.map((paper) => (
                <div key={paper.id} className="rounded-md border border-border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{paper.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{paper.questionSnapshots.length} 题 · {paper.totalScore} 分 · {paper.durationMinutes} 分钟</p>
                    </div>
                    <Badge>{paper.subject}</Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap justify-end gap-2">
                    <Button variant="secondary" size="sm" onClick={() => loadPaper(paper)}>继续编辑</Button>
                    <Link href={`/papers/${paper.id}`}><Button variant="secondary" size="sm">查看试卷</Button></Link>
                    <Button variant="danger" size="sm" onClick={() => deletePaper(paper.id)}>删除</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>自动组卷</CardTitle>
              <CardDescription>基于审核通过题目进行规则匹配，生成可人工调整的试卷草稿。</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-5">
              <Field label="题量"><Input type="number" min={1} max={20} value={autoConfig.count} onChange={(event) => setAutoConfig((prev) => ({ ...prev, count: Number(event.target.value) }))} /></Field>
              <Field label="知识点"><Input value={autoConfig.knowledgePoint} onChange={(event) => setAutoConfig((prev) => ({ ...prev, knowledgePoint: event.target.value }))} placeholder="可为空" /></Field>
              <Field label="题型">
                <Select value={autoConfig.questionType} onChange={(event) => setAutoConfig((prev) => ({ ...prev, questionType: event.target.value as AutoConfig["questionType"] }))}>
                  <option value="all">全部</option>
                  {questionTypes.map((item) => <option key={item}>{item}</option>)}
                </Select>
              </Field>
              <Field label="难度">
                <Select value={autoConfig.difficulty} onChange={(event) => setAutoConfig((prev) => ({ ...prev, difficulty: event.target.value as AutoConfig["difficulty"] }))}>
                  <option value="all">全部</option>
                  {difficulties.map((item) => <option key={item}>{item}</option>)}
                </Select>
              </Field>
              <Field label="分层模板">
                <Select value={autoConfig.template} onChange={(event) => setAutoConfig((prev) => ({ ...prev, template: event.target.value as AutoConfig["template"] }))}>
                  <option>基础巩固</option>
                  <option>标准练习</option>
                  <option>能力提升</option>
                </Select>
              </Field>
              <div className="md:col-span-5">
                <Button onClick={autoCompose}><Sparkles className="h-4 w-4" />自动加入匹配题目</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>审核通过题目</CardTitle>
              <CardDescription>只有审核通过的题目可以进入组卷池。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-5">
                <Field label="学科">
                  <Select value={filters.subject} onChange={(event) => setFilters((prev) => ({ ...prev, subject: event.target.value as Filters["subject"] }))}>
                    <option value="all">全部</option>
                    {subjects.map((item) => <option key={item}>{item}</option>)}
                  </Select>
                </Field>
                <Field label="年级">
                  <Select value={filters.grade} onChange={(event) => setFilters((prev) => ({ ...prev, grade: event.target.value as Filters["grade"] }))}>
                    <option value="all">全部</option>
                    {grades.map((item) => <option key={item}>{item}</option>)}
                  </Select>
                </Field>
                <Field label="题型">
                  <Select value={filters.questionType} onChange={(event) => setFilters((prev) => ({ ...prev, questionType: event.target.value as Filters["questionType"] }))}>
                    <option value="all">全部</option>
                    {questionTypes.map((item) => <option key={item}>{item}</option>)}
                  </Select>
                </Field>
                <Field label="难度">
                  <Select value={filters.difficulty} onChange={(event) => setFilters((prev) => ({ ...prev, difficulty: event.target.value as Filters["difficulty"] }))}>
                    <option value="all">全部</option>
                    {difficulties.map((item) => <option key={item}>{item}</option>)}
                  </Select>
                </Field>
                <Field label="知识点"><Input value={filters.knowledgePoint} onChange={(event) => setFilters((prev) => ({ ...prev, knowledgePoint: event.target.value }))} placeholder="关键词" /></Field>
              </div>

              {!approvedQuestions.length ? (
                <div className="rounded-md border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                  暂无审核通过题目，请先到题目审核页通过题目。
                  <div className="mt-4"><Link href="/review"><Button variant="secondary">去审核题目</Button></Link></div>
                </div>
              ) : null}
              {approvedQuestions.length && !filteredQuestions.length ? <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">暂无匹配的可选题目。</div> : null}

              <div className="grid gap-3">
                {filteredQuestions.map((question) => (
                  <div key={question.id} className="rounded-md border border-border p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>{question.subject}</Badge>
                      <Badge>{question.grade}</Badge>
                      <Badge>{question.questionType}</Badge>
                      <Badge>{question.difficulty}</Badge>
                      <Badge>{question.qualityScore.totalScore} 分</Badge>
                    </div>
                    <p className="mt-3 text-sm font-medium leading-6">{question.stem}</p>
                    <div className="mt-3 flex justify-end"><Button size="sm" onClick={() => addQuestion(question)}>加入试卷</Button></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>已选题目</CardTitle>
              <CardDescription>{selectedQuestions.length} 题 · 总分 {selectedQuestions.length * 10} 分</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {!selectedQuestions.length ? <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">请从上方题库中加入题目。</div> : null}
              {selectedQuestions.map((question, index) => (
                <div key={`${question.id}-${index}`} className="rounded-md border border-border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">第 {index + 1} 题 · 10 分</p>
                      <p className="mt-2 text-sm leading-6">{question.stem}</p>
                    </div>
                    <FileText className="h-5 w-5 shrink-0 text-primary" />
                  </div>
                  <div className="mt-3 flex flex-wrap justify-end gap-2">
                    <Button variant="secondary" size="sm" onClick={() => moveQuestion(index, -1)} disabled={index === 0}><ArrowUp className="h-4 w-4" />上移</Button>
                    <Button variant="secondary" size="sm" onClick={() => moveQuestion(index, 1)} disabled={index === selectedQuestions.length - 1}><ArrowDown className="h-4 w-4" />下移</Button>
                    <Button variant="danger" size="sm" onClick={() => removeQuestion(question.id)}><Trash2 className="h-4 w-4" />移除</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

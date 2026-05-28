# EduGen AI

EduGen AI 是一个面向教研场景的 AI 题目生成、质量评估、人工审核与智能组卷平台 Demo，适合作为 AI 产品经理、AI 教育产品实习生、AIGC 产品经理实习生或 LLM 应用产品实习生的作品集项目。

项目使用真实 OpenAI-compatible API 生成题目和质量评分，不提供 Mock 生成模式。

```text
输入生成条件 -> 真实 AI 生成题目 -> AI 质量评分 -> 人工审核 -> 经验沉淀 -> 智能组卷 -> 数据看板 -> Prompt 优化
```

## 功能亮点

- 真实 AI 题目生成：通过 `OPENAI_API_KEY`、`OPENAI_BASE_URL`、`AI_MODEL` 接入 OpenAI 或兼容服务。
- AI 质量评分：从知识点匹配度、难度一致性、答案正确性、解析完整度、表述清晰度五个维度评分。
- 人工审核闭环：支持通过、需修改、不通过，沉淀问题标签、修改建议和审核备注。
- 题目二次编辑：审核页可直接修改题干、选项、答案、解析、知识点和难度。
- 质量规则库：将教师审核经验沉淀为可复用的题目质量规则与教研知识。
- 智能组卷：支持从审核通过题目中人工选题，也支持按题量、知识点、题型、难度和分层模板自动组卷。
- 个性化测验：试卷支持教学场景、学生层次和练习目标配置。
- 试卷快照编辑：试卷详情页可编辑题目快照，不影响原题库题目。
- 打印导出：试卷可通过浏览器打印 / 另存 PDF。

## 技术栈

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui 风格的本地 UI 组件
- Recharts
- LocalStorage 本地数据
- OpenAI-compatible API

## 页面说明

- 首页：展示项目定位、核心流程和关键指标。
- 题目生成：按教研条件调用真实 AI API 生成题目和质量评分。
- 题目详情：展示题目内容、评分维度和 AI 评估建议。
- 题目审核：审核题目、编辑题目、标记问题标签、记录人工修改建议。
- 质量规则库：管理从审核过程沉淀出的质量规则和高频问题。
- 组卷中心：人工选题或自动组卷，生成并保存个性化试卷。
- 试卷详情：展示试题、答案解析，支持编辑快照和打印导出 PDF。
- Prompt 模板：管理 Prompt 模板和版本表现。
- 数据看板：分析生成质量、审核通过率、问题分布、质量规则和模板效果。

## 本地启动

```bash
npm install
npm run dev
```

启动后访问：

```text
http://localhost:3000
```

## 环境变量配置

题目生成必须配置真实 API Key。请复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

然后填写：

```env
OPENAI_API_KEY=your_api_key
OPENAI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini
```

如果使用小米 MiMo 等 OpenAI-compatible 服务，可以改为对应服务商提供的 Base URL 和模型名，例如：

```env
OPENAI_API_KEY=your_mimo_api_key
OPENAI_BASE_URL=https://token-plan-cn.xiaomimimo.com/v1
AI_MODEL=mimo-v2.5-pro
```

注意：`.env.local` 已加入 `.gitignore`，不要把真实 API Key 上传到 GitHub。

## 真实 API 行为

- 未配置 `OPENAI_API_KEY` 时，题目生成接口会返回错误提示，不会生成模拟题。
- 真实 API 调用失败时，页面会显示错误原因，不会 fallback 到模拟数据。
- 项目仍会把成功生成的题目、审核记录、质量规则和试卷保存在浏览器 LocalStorage 中。

## 项目结构

```text
src/
  app/
    api/generate/route.ts
    dashboard/page.tsx
    generate/page.tsx
    papers/page.tsx
    papers/[id]/page.tsx
    prompts/page.tsx
    questions/[id]/page.tsx
    review/page.tsx
    rules/page.tsx
  components/
    charts/
    layout/
    ui/
  lib/
    ai/
    data/
    utils/
  types/
```


# EduGen AI

EduGen AI 是一个面向教研场景的 AI 题目生成与质量评估平台 Demo，适合作为 AI 产品经理、AI 教育产品实习生、AIGC 产品经理实习生或 LLM 应用产品实习生的作品集项目。

项目围绕 AI 教育内容生产设计完整产品闭环：

```text
输入生成条件 -> AI 生成题目 -> AI 质量评分 -> 人工审核 -> 问题归因 -> 数据看板 -> Prompt 优化
```

## 功能亮点

- 题目生成工作台：支持学科、年级、知识点、题型、难度、生成数量和 Prompt 模板配置。
- AI 质量评分：从知识点匹配度、难度一致性、答案正确性、解析完整度、表述清晰度五个维度评分。
- 人工审核闭环：支持通过、需修改、不通过，沉淀问题标签、修改建议和审核备注。
- 题目管理：支持删除不需要的已生成题目，删除后看板统计自动更新。
- Prompt 模板管理：支持查看、新建、编辑、复制为新版本、启用和停用模板。
- 数据看板：展示生成量、审核通过率、平均质量分、题型分布、难度分布、问题标签和模板效果。
- Mock 模式可用：没有 API Key 时也可以完整演示。

## 技术栈

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui 风格的本地 UI 组件
- Recharts
- LocalStorage 本地演示数据
- OpenAI-compatible API 预留

## 页面说明

- 首页：展示项目定位、核心流程和关键指标。
- 题目生成：按教研条件生成题目，并自动生成 AI 质量评分。
- 题目详情：展示题目内容、评分维度和 AI 评估建议。
- 人工审核：审核题目、标记问题标签、记录人工修改建议。
- Prompt 模板：管理 Prompt 模板和版本表现。
- 数据看板：分析生成质量、审核通过率、问题分布和模板效果。

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

项目默认支持 Mock 模式，不配置 API Key 也能运行。

如果需要接入真实大模型，请复制 `.env.example` 为 `.env.local`：

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

## Mock 模式说明

未配置 `OPENAI_API_KEY` 时，系统会自动进入 Mock 演示模式。Mock 模式会根据学科、年级、知识点、题型、难度和 Prompt 模板生成模拟题目，并给出合理的质量评分。

如果真实 AI 调用失败，服务端会 fallback 到 Mock，并在页面展示友好提示。

## 项目结构

```text
src/
  app/
    api/generate/route.ts
    dashboard/page.tsx
    generate/page.tsx
    prompts/page.tsx
    questions/[id]/page.tsx
    review/page.tsx
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

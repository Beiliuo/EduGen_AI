import { generateQuestion } from "@/lib/ai/generateQuestion";
import type { ApiConfig } from "@/types/apiConfig";
import type { GenerateQuestionInput } from "@/types/question";
import { NextResponse } from "next/server";

type GenerateRequestBody =
  | GenerateQuestionInput
  | {
      input: GenerateQuestionInput;
      apiConfig?: Partial<ApiConfig>;
    };

function isWrappedBody(body: GenerateRequestBody): body is { input: GenerateQuestionInput; apiConfig?: Partial<ApiConfig> } {
  return "input" in body;
}

export async function GET() {
  return NextResponse.json({
    mode: "real",
    configured: Boolean(process.env.OPENAI_API_KEY),
    baseUrl: process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
    model: process.env.AI_MODEL ?? "gpt-4o-mini",
    source: process.env.OPENAI_API_KEY ? "env" : "none"
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateRequestBody;
    const input = isWrappedBody(body) ? body.input : body;
    const apiConfig = isWrappedBody(body) ? body.apiConfig : undefined;
    const result = await generateQuestion(input, apiConfig);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        questions: [],
        mode: "real",
        message: error instanceof Error ? error.message : "生成题目失败"
      },
      { status: 400 }
    );
  }
}

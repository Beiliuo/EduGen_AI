import { generateQuestion } from "@/lib/ai/generateQuestion";
import type { GenerateQuestionInput } from "@/types/question";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    mode: "real",
    configured: Boolean(process.env.OPENAI_API_KEY),
    baseUrl: process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
    model: process.env.AI_MODEL ?? "gpt-4o-mini"
  });
}

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as GenerateQuestionInput;
    const result = await generateQuestion(input);
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

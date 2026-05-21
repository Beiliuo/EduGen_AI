import { generateQuestion } from "@/lib/ai/generateQuestion";
import type { GenerateQuestionInput } from "@/types/question";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    mode: process.env.OPENAI_API_KEY ? "real" : "mock"
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
        mode: "mock",
        message: error instanceof Error ? error.message : "生成题目失败"
      },
      { status: 400 }
    );
  }
}

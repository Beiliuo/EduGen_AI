import { testAIConnection } from "@/lib/ai/generateQuestion";
import type { ApiConfig } from "@/types/apiConfig";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { apiConfig?: Partial<ApiConfig> };
    const result = await testAIConnection(body.apiConfig);
    return NextResponse.json({
      ok: true,
      message: "API 连接成功",
      baseUrl: result.baseUrl,
      model: result.model
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "API 连接失败"
      },
      { status: 400 }
    );
  }
}

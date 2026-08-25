import { NextRequest, NextResponse } from "next/server";
import { ScenePlanInputSchema, aiScenePlanner } from "@musicmotion/ai";
import type { ScenePlanInput } from "@musicmotion/shared";

export const runtime = "nodejs";

/**
 * POST /api/ai/scene-plan
 * Generates a structured multi-scene storyboard based on track metadata,
 * timing selection, captions, and creative visual style direction.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Strict Zod input validation
    const parsed = ScenePlanInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid scene plan request payload",
          details: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
        },
        { status: 400 }
      );
    }

    const input = parsed.data;

    // 2. Generate scene plan with automatic resilience & fallback
    const scenePlan = await aiScenePlanner.generateScenePlanWithFallback(
      input as unknown as ScenePlanInput
    );


    return NextResponse.json({
      success: true,
      plan: scenePlan,
    });
  } catch (error) {
    console.error("AI Scene Plan generation failed:", error);
    return NextResponse.json(
      {
        error: "Failed to generate AI scene plan",
        message: (error as Error).message || "Internal server error",
      },
      { status: 500 }
    );
  }
}

import { NextResponse, type NextRequest } from "next/server";
import { generateId } from "@musicmotion/shared";
import type { RenderJob } from "@musicmotion/shared";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const projectId = body.projectId || generateId();

    const job: RenderJob = {
      id: generateId(),
      projectId,
      status: "queued",
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      job,
      message: "Render job successfully queued in background pipeline",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to schedule render job", details: String(error) },
      { status: 500 }
    );
  }
}

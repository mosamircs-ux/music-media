import { NextRequest, NextResponse } from "next/server";
import { inMemoryRenderJobStore } from "@musicmotion/video";

export const runtime = "nodejs";

/**
 * GET /api/render/status/[jobId]
 *
 * Polls the current stage, percentage, and output URL of an active render job.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  const job = inMemoryRenderJobStore.getJob(jobId);
  if (!job) {
    return NextResponse.json({ error: "Render job not found" }, { status: 404 });
  }

  return NextResponse.json(inMemoryRenderJobStore.toProgressInfo(job));
}
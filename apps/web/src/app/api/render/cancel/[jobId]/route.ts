import { NextRequest, NextResponse } from "next/server";
import { inMemoryRenderJobStore } from "@musicmotion/video";

export const runtime = "nodejs";

/**
 * DELETE /api/render/cancel/[jobId]
 *
 * Cancels an in-progress render job.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  const job = inMemoryRenderJobStore.getJob(jobId);
  if (!job) {
    return NextResponse.json({ error: "Render job not found" }, { status: 404 });
  }

  if (job.status === "completed") {
    return NextResponse.json({ cancelled: false, reason: "Job already completed" });
  }

  const cancelled = inMemoryRenderJobStore.cancelJob(jobId);

  return NextResponse.json({
    cancelled: true,
    job: cancelled ? inMemoryRenderJobStore.toProgressInfo(cancelled) : null,
  });
}
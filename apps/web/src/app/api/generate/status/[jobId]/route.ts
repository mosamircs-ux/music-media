import { NextRequest, NextResponse } from "next/server";
import { inMemoryAssetStore } from "@musicmotion/video";
import type { GenerationJobStatus } from "@musicmotion/shared";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const assetId = inMemoryAssetStore.getAssetIdByJob(jobId);
  if (!assetId) return NextResponse.json({ error: "Job not found" }, { status: 404 });
  const asset = inMemoryAssetStore.get(assetId);
  if (!asset) return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  const progressMap: Record<string, number> = { queued: 5, processing: 50, completed: 100, failed: 0, cancelled: 0 };
  const response: GenerationJobStatus = {
    jobId,
    assetId: asset.id,
    sceneId: asset.sceneId,
    status: asset.status,
    progress: progressMap[asset.status] ?? 0,
    previewUrl: asset.previewUrl,
    storageUrl: asset.storageUrl,
    error: asset.errorMessage,
    updatedAt: asset.updatedAt,
  };
  return NextResponse.json(response);
}

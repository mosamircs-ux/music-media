import { NextRequest, NextResponse } from "next/server";
import { inMemoryAssetStore, visualGenerationRegistry } from "@musicmotion/video";

export const runtime = "nodejs";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const assetId = inMemoryAssetStore.getAssetIdByJob(jobId);
  if (!assetId) return NextResponse.json({ error: "Job not found" }, { status: 404 });
  const asset = inMemoryAssetStore.get(assetId);
  if (!asset) return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  if (asset.status === "completed" || asset.status === "cancelled") {
    return NextResponse.json({ cancelled: false, reason: "Job already in terminal state" });
  }
  const provider = visualGenerationRegistry.getProvider();
  await provider.cancelGeneration(jobId).catch(() => {});
  inMemoryAssetStore.update(assetId, { status: "cancelled", completedAt: new Date().toISOString() });
  return NextResponse.json({ cancelled: true, assetId, sceneId: asset.sceneId });
}

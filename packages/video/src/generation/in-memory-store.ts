import type { GeneratedAsset, AssetStatus } from "@musicmotion/shared";
import { generateId } from "@musicmotion/shared";

/**
 * InMemoryAssetStore
 *
 * A lightweight in-memory store used when no database is connected (dev mode).
 * In production replace with real Prisma calls in the API routes.
 */
class InMemoryAssetStoreClass {
  private assets = new Map<string, GeneratedAsset>();
  // Maps jobId → assetId for status lookups
  private jobToAsset = new Map<string, string>();

  create(data: Omit<GeneratedAsset, "id" | "createdAt" | "updatedAt">): GeneratedAsset {
    const now = new Date().toISOString();
    const id = generateId();
    const asset: GeneratedAsset = { ...data, id, createdAt: now, updatedAt: now };
    this.assets.set(id, asset);
    return asset;
  }

  update(id: string, updates: Partial<GeneratedAsset>): GeneratedAsset | null {
    const asset = this.assets.get(id);
    if (!asset) return null;
    const updated = { ...asset, ...updates, updatedAt: new Date().toISOString() };
    this.assets.set(id, updated);
    return updated;
  }

  get(id: string): GeneratedAsset | null {
    return this.assets.get(id) ?? null;
  }

  getBySceneId(sceneId: string): GeneratedAsset[] {
    return Array.from(this.assets.values()).filter((a) => a.sceneId === sceneId);
  }

  registerJob(jobId: string, assetId: string): void {
    this.jobToAsset.set(jobId, assetId);
  }

  getAssetIdByJob(jobId: string): string | null {
    return this.jobToAsset.get(jobId) ?? null;
  }

  /**
   * Find the most recent pending or active job for a scene (duplicate guard).
   */
  findPendingForScene(sceneId: string): GeneratedAsset | null {
    const pending: AssetStatus[] = ["queued", "processing"];
    const matches = this.getBySceneId(sceneId).filter((a) => pending.includes(a.status));
    if (!matches.length) return null;
    return matches.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  }

  clear(): void {
    this.assets.clear();
    this.jobToAsset.clear();
  }
}

export const inMemoryAssetStore = new InMemoryAssetStoreClass();

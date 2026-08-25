import { NextResponse, type NextRequest } from "next/server";
import { musicProviders } from "@musicmotion/music";
import type { MusicProviderType } from "@musicmotion/shared";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || searchParams.get("query") || "";
    const providerType = searchParams.get("provider") as MusicProviderType | null;
    const limit = Math.min(Math.max(1, Number(searchParams.get("limit")) || 20), 50);
    const offset = Math.max(0, Number(searchParams.get("offset")) || 0);
    const genre = searchParams.get("genre") || undefined;
    const bpmMin = searchParams.get("bpmMin") ? Number(searchParams.get("bpmMin")) : undefined;
    const bpmMax = searchParams.get("bpmMax") ? Number(searchParams.get("bpmMax")) : undefined;

    const result = await musicProviders.searchWithFallback(query, {
      provider: providerType || undefined,
      limit,
      offset,
      genre,
      bpmMin,
      bpmMax,
    });

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=180, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Music search API error:", error);
    return NextResponse.json(
      { error: "Failed to search music tracks", details: String(error) },
      { status: 500 }
    );
  }
}

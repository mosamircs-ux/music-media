import { NextResponse, type NextRequest } from "next/server";
import { musicProviders } from "@musicmotion/music";
import type { MusicProviderType } from "@musicmotion/shared";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const providerType = (searchParams.get("provider") || "jamendo") as MusicProviderType;
    const limit = Number(searchParams.get("limit")) || 20;
    const offset = Number(searchParams.get("offset")) || 0;

    const result = await musicProviders.searchWithFallback(query, {
      provider: providerType,
      limit,
      offset,
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error("Track search API error:", error);
    return NextResponse.json(
      { error: "Failed to search music tracks", details: String(error) },
      { status: 500 }
    );
  }
}

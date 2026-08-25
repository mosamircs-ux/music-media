import { NextResponse, type NextRequest } from "next/server";
import { musicProviders } from "@musicmotion/music";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Artist ID is required" }, { status: 400 });
    }

    let artist = null;
    for (const provider of musicProviders.getAllProviders()) {
      try {
        artist = await provider.getArtist(id);
        if (artist) break;
      } catch {
        // continue
      }
    }

    if (!artist) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }

    return NextResponse.json(artist, {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    console.error("Get Artist API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch artist details", details: String(error) },
      { status: 500 }
    );
  }
}

import { NextResponse, type NextRequest } from "next/server";
import { musicProviders } from "@musicmotion/music";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Album ID is required" }, { status: 400 });
    }

    let album = null;
    for (const provider of musicProviders.getAllProviders()) {
      try {
        album = await provider.getAlbum(id);
        if (album) break;
      } catch {
        // continue
      }
    }

    if (!album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    return NextResponse.json(album, {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    console.error("Get Album API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch album details", details: String(error) },
      { status: 500 }
    );
  }
}

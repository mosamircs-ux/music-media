import { NextResponse, type NextRequest } from "next/server";
import { musicProviders } from "@musicmotion/music";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Track ID is required" }, { status: 400 });
    }

    const track = await musicProviders.getTrackAcrossProviders(id);
    if (!track) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }

    const provider = musicProviders.getProvider(track.provider);
    const availability = await provider.getAvailability(track.id);

    return NextResponse.json({
      track,
      availability,
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
      },
    });
  } catch (error) {
    console.error("Get Track API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch track details", details: String(error) },
      { status: 500 }
    );
  }
}

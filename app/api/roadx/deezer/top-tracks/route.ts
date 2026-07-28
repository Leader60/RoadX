import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const playlistId = searchParams.get("playlist_id") || "3155776842";
    const limit = searchParams.get("limit") || "10";

    const res = await fetch(
      `https://api.deezer.com/playlist/${playlistId}/tracks?limit=${limit}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) throw new Error(`Deezer API error: ${res.status}`);

    const data = await res.json();

    const tracks = data.data?.map((item: any) => ({
      id: item.id?.toString() || "",
      title: item.title || "غير معروف",
      artist: item.artist?.name || "غير معروف",
      album: item.album?.title || "",
      image: item.album?.cover_big || "",
      deezer_url: item.link || "",
      preview_url: item.preview || null,
      duration_ms: (item.duration || 0) * 1000,
      rank: item.position || 0,
    })) || [];

    return NextResponse.json({ tracks, total: tracks.length });
  } catch (error: any) {
    return NextResponse.json({ tracks: [], error: error.message }, { status: 500 });
  }
}

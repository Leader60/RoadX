import { NextRequest, NextResponse } from "next/server";

// Deezer Playlist IDs للدول
const DEEZER_PLAYLISTS: Record<string, number> = {
  global: 3155776842,
  US: 1506518311,
  GB: 1111143121,
  FR: 1109890291,
  DE: 1111141961,
  SA: 1051268111,
  AE: 1067412441,
  KW: 1089870841,
  EG: 1091273181,
  MA: 1088169891,
  DZ: 1088169861,
  TN: 1088169901,
  LB: 1089870781,
  JO: 1089870801,
  IQ: 1089870761,
  QA: 1089870821,
  BH: 1089870721,
  OM: 1089870861,
  NL: 1111143141,
  IT: 1109890301,
  ES: 1111141961,
  PT: 1111143151,
  GR: 1111143121,
  RU: 1111143161,
  BR: 1111143171,
  JP: 1111143181,
  KR: 1111143191,
  IN: 1111143201,
  AU: 1111143211,
  CA: 1111143221,
  MX: 1111143231,
  SE: 1111143241,
  NO: 1111143251,
  CY: 1111143261,
  VN: 1111143271,
  ID: 1111143281,
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country") || "global";
    const limit = searchParams.get("limit") || "20";

    const playlistId = DEEZER_PLAYLISTS[country] || DEEZER_PLAYLISTS["global"];

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
      image: item.album?.cover_big || item.album?.cover_medium || "",
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

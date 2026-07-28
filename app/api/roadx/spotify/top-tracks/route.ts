import { NextRequest, NextResponse } from "next/server";

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;

let cachedToken: { token: string; expires: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expires) {
    return cachedToken.token;
  }

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) throw new Error("فشل الحصول على رمز Spotify");

  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expires: Date.now() + data.expires_in * 1000 - 60000, // ينتهي قبل دقيقة
  };
  return data.access_token;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const playlistId = searchParams.get("playlist_id") || "37i9dQZEVXbMDoHDwVN2tF";
    const limit = searchParams.get("limit") || "10";

    const token = await getAccessToken();
    const res = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${limit}&market=KW`,
      {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 3600 }, // كاش لمدة ساعة
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || `Spotify API error: ${res.status}`);
    }

    const data = await res.json();

    const tracks = data.items.map((item: any) => ({
      id: item.track.id,
      title: item.track.name,
      artist: item.track.artists.map((a: any) => a.name).join("، "),
      album: item.track.album.name,
      image: item.track.album.images[0]?.url || "",
      spotify_url: item.track.external_urls.spotify,
      preview_url: item.track.preview_url,
      duration_ms: item.track.duration_ms,
      popularity: item.track.popularity,
    }));

    return NextResponse.json({
      tracks,
      total: data.total,
      country: "KW",
    });
  } catch (error: any) {
    console.error("Spotify API Error:", error);
    return NextResponse.json(
      { error: error.message || "فشل جلب البيانات من Spotify" },
      { status: 500 }
    );
  }
}

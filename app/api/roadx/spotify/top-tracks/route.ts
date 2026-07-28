import { NextRequest, NextResponse } from "next/server";

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;

let cachedToken: { token: string; expires: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expires) {
    return cachedToken.token;
  }

  try {
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
      },
      body: "grant_type=client_credentials",
    });

    const text = await res.text();
    
    // محاولة تحليل النص كـ JSON
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("Spotify Auth Response (not JSON):", text.slice(0, 200));
      throw new Error(`فشل تحليل استجابة Spotify: ${text.slice(0, 100)}`);
    }

    if (!res.ok || data.error) {
      console.error("Spotify Auth Error:", data);
      throw new Error(data.error_description || data.error || "فشل المصادقة مع Spotify");
    }

    cachedToken = {
      token: data.access_token,
      expires: Date.now() + data.expires_in * 1000 - 60000,
    };
    return data.access_token;
  } catch (error: any) {
    console.error("getAccessToken Error:", error);
    throw error;
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const playlistId = searchParams.get("playlist_id") || "37i9dQZEVXbMDoHDwVN2tF";
    const limit = searchParams.get("limit") || "10";

    // التحقق من وجود متغيرات البيئة
    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
      return NextResponse.json(
        { error: "متغيرات البيئة SPOTIFY غير مضبوطة" },
        { status: 500 }
      );
    }

    const token = await getAccessToken();

    const res = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${limit}&market=KW`,
      {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 3600 },
      }
    );

    const text = await res.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("Spotify Tracks Response (not JSON):", text.slice(0, 200));
      return NextResponse.json(
        { error: "استجابة غير متوقعة من Spotify" },
        { status: 502 }
      );
    }

    if (!res.ok) {
      console.error("Spotify API Error:", data);
      return NextResponse.json(
        { error: data.error?.message || `خطأ Spotify: ${res.status}` },
        { status: res.status }
      );
    }

    const tracks = data.items?.map((item: any) => ({
      id: item.track?.id || "",
      title: item.track?.name || "غير معروف",
      artist: item.track?.artists?.map((a: any) => a.name).join("، ") || "غير معروف",
      album: item.track?.album?.name || "",
      image: item.track?.album?.images?.[0]?.url || "",
      spotify_url: item.track?.external_urls?.spotify || "",
      preview_url: item.track?.preview_url || null,
      duration_ms: item.track?.duration_ms || 0,
      popularity: item.track?.popularity || 0,
    })) || [];

    return NextResponse.json({
      tracks,
      total: tracks.length,
      playlist_id: playlistId,
    });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error.message || "خطأ داخلي في الخادم" },
      { status: 500 }
    );
  }
}

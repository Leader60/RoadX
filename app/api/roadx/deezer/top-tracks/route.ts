import { NextRequest, NextResponse } from "next/server";

const LASTFM_API_KEY = process.env.LASTFM_API_KEY!;

const COUNTRY_CODES: Record<string, string> = {
  global: "",
  US: "united states",
  GB: "united kingdom",
  FR: "france",
  DE: "germany",
  NL: "netherlands",
  IT: "italy",
  ES: "spain",
  PT: "portugal",
  GR: "greece",
  CY: "cyprus",
  SA: "saudi arabia",
  AE: "united arab emirates",
  KW: "kuwait",
  BH: "bahrain",
  QA: "qatar",
  OM: "oman",
  SY: "syria",
  LB: "lebanon",
  JO: "jordan",
  IQ: "iraq",
  EG: "egypt",
  TN: "tunisia",
  DZ: "algeria",
  MA: "morocco",
  RU: "russia",
  BR: "brazil",
  JP: "japan",
  KR: "south korea",
  IN: "india",
  AU: "australia",
  CA: "canada",
  MX: "mexico",
  SE: "sweden",
  NO: "norway",
  VN: "vietnam",
  ID: "indonesia",
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country") || "global";
    const limit = searchParams.get("limit") || "20";

    const countryName = COUNTRY_CODES[country] || "";

    let url: string;
    if (countryName) {
      url = `https://ws.audioscrobbler.com/2.0/?method=geo.gettoptracks&country=${encodeURIComponent(countryName)}&api_key=${LASTFM_API_KEY}&format=json&limit=${limit}`;
    } else {
      url = `https://ws.audioscrobbler.com/2.0/?method=chart.gettoptracks&api_key=${LASTFM_API_KEY}&format=json&limit=${limit}`;
    }

    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (!res.ok) throw new Error(`Last.fm API error: ${res.status}`);

    const data = await res.json();

    let tracksData: any[] = [];
    if (data.tracks?.track) {
      tracksData = data.tracks.track;
    } else if (data.toptracks?.track) {
      tracksData = data.toptracks.track;
    }

    // جلب روابط YouTube لكل أغنية
    const tracks = await Promise.all(
      tracksData.map(async (item: any, index: number) => {
        let youtubeUrl = "";
        try {
          const ytRes = await fetch(
            `https://ws.audioscrobbler.com/2.0/?method=track.getinfo&artist=${encodeURIComponent(item.artist?.name || "")}&track=${encodeURIComponent(item.name || "")}&api_key=${LASTFM_API_KEY}&format=json`
          );
          const ytData = await ytRes.json();
          youtubeUrl = ytData.track?.url || "";
        } catch {}

        return {
          id: item.mbid || `lfm-${index}`,
          title: item.name || "غير معروف",
          artist: item.artist?.name || "غير معروف",
          album: "",
          image: item.image?.find((img: any) => img.size === "extralarge")?.["#text"]
            || item.image?.find((img: any) => img.size === "large")?.["#text"]
            || item.image?.[0]?.["#text"]
            || "",
          lastfm_url: item.url || "",
          youtube_url: youtubeUrl,
          preview_url: null,
          duration_ms: 0,
          rank: index + 1,
          listeners: item.listeners || "0",
        };
      })
    );

    return NextResponse.json({ tracks, total: tracks.length, country: countryName || "عالمي" });
  } catch (error: any) {
    return NextResponse.json({ tracks: [], error: error.message }, { status: 500 });
  }
}

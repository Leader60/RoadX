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

    const tracks = tracksData.map((item: any, index: number) => {
      // استخراج الصورة بأفضل جودة متاحة
      const images = item.image || [];
      let image = "";
      for (const size of ["extralarge", "large", "medium", "small"]) {
        const found = images.find((img: any) => img.size === size);
        if (found && found["#text"] && found["#text"].trim() !== "") {
          image = found["#text"];
          break;
        }
      }

      const query = encodeURIComponent(`${item.artist?.name || ""} ${item.name || ""}`);

      return {
        id: item.mbid || `lfm-${index}`,
        title: item.name || "غير معروف",
        artist: item.artist?.name || "غير معروف",
        image: image,
        lastfm_url: item.url || "",
        youtube_search: `https://www.youtube.com/results?search_query=${query}`,
        rank: index + 1,
        listeners: item.listeners || "0",
      };
    });

    return NextResponse.json({ tracks, total: tracks.length, country: countryName || "عالمي" });
  } catch (error: any) {
    return NextResponse.json({ tracks: [], error: error.message }, { status: 500 });
  }
}

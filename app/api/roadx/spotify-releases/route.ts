import { NextResponse } from "next/server";
import { getNewReleases } from "@/lib/spotify";

export async function GET() {
  try {
    const albums = await getNewReleases(10, "US");
    const simplified = albums.map((a: any) => ({
      id: a.id,
      title: a.name,
      artist: a.artists?.map((ar: any) => ar.name).join(", ") || "",
      image: a.images?.[0]?.url || "",
      url: a.external_urls?.spotify || "",
      releaseDate: a.release_date,
    }));
    return NextResponse.json({ releases: simplified });
  } catch (error: any) {
    return NextResponse.json({ releases: [], error: error.message }, { status: 200 });
  }
}

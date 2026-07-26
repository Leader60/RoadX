import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim().toLowerCase().replace(/^@/, "");

  if (!username) {
    return NextResponse.json({ active: false });
  }

  try {
    const keys = await redis.keys("subscription:*");
    for (const key of keys) {
      const data = await redis.get<any>(key);
      const storedUsername = data?.piUsername?.trim().toLowerCase().replace(/^@/, "");
      if (storedUsername === username && data?.status === "active") {
        return NextResponse.json({ active: true, expirationDate: data.expirationDate });
      }
    }
    return NextResponse.json({ active: false });
  } catch (error: any) {
    return NextResponse.json({ active: false, error: error.message });
  }
}

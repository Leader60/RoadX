import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export async function GET() {
  try {
    const keys = await redis.keys("subscription:*");
    return NextResponse.json({ count: keys.length });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}

import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid");
  if (!uid) return NextResponse.json({ active: false });

  const sub = await redis.get<any>(`subscription:${uid}`);
  if (sub && sub.status === "active") {
    return NextResponse.json({ active: true, expirationDate: sub.expirationDate });
  }
  return NextResponse.json({ active: false });
}

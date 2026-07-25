import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

interface SubscriptionRecord {
  status: string;
  expirationDate?: string;
  [key: string]: unknown;
}

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid");

    if (!uid) {
      return NextResponse.json({ active: false });
    }

    const sub = await redis.get<SubscriptionRecord>(`subscription:${uid}`);

    if (sub && typeof sub === "object" && sub.status === "active") {
      return NextResponse.json({
        active: true,
        expirationDate: sub.expirationDate ?? null,
      });
    }

    return NextResponse.json({ active: false });
  } catch (error) {
    console.error("Subscription status fetch error:", error);
    return NextResponse.json({ active: false }, { status: 500 });
  }
}

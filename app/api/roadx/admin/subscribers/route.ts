import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

function toKuwaitTime(isoString?: string): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleString("ar-KW", {
    timeZone: "Asia/Kuwait",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const keys = await redis.keys("subscription:*");
    const subscribers = await Promise.all(
      keys.map(async (key) => {
        const data = await redis.get<any>(key);
        return {
          ...data,
          savedAt_kuwait: toKuwaitTime(data?.savedAt),
        };
      })
    );

    // ترتيب الأحدث أولاً
    subscribers.sort((a, b) => {
      const dateA = new Date(a?.savedAt || 0).getTime();
      const dateB = new Date(b?.savedAt || 0).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({
      count: subscribers.length,
      subscribers,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "خطأ داخلي: " + error.message }, { status: 500 });
  }
}

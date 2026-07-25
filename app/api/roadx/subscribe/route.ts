import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { fullName, email, piUid, durationDays } = data || {};

    if (!fullName || !email || !piUid) {
      return NextResponse.json(
        { error: "البيانات الأساسية ناقصة" },
        { status: 400 }
      );
    }

    const days = typeof durationDays === "number" ? durationDays : 30;
    const expiration = new Date();
    expiration.setDate(expiration.getDate() + days);

    const subscriptionPayload = {
      fullName,
      email,
      piUid,
      status: "active",
      savedAt: new Date().toISOString(),
      expirationDate: expiration.toISOString(),
    };

    await redis.set(`subscription:${piUid}`, subscriptionPayload);

    return NextResponse.json(
      { success: true, message: "تم تفعيل الاشتراك بنجاح" },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "خطأ داخلي: " + (err?.message || "Internal Error") },
      { status: 500 }
    );
  }
}

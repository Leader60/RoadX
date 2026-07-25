import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

// تعريف بنية الطلب القادم لتجنب أخطاء TypeScript (Implicit Any)
interface SubscribeRequestBody {
  fullName?: string;
  email?: string;
  piUid?: string;
  durationDays?: number;
}

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export async function POST(request: Request) {
  try {
    const data: SubscribeRequestBody = await request.json();
    const { fullName, email, piUid, durationDays = 30 } = data;

    if (!fullName || !email || !piUid) {
      return NextResponse.json(
        { error: "البيانات الأساسية ناقصة" },
        { status: 400 }
      );
    }

    const expiration = new Date();
    expiration.setDate(expiration.getDate() + Number(durationDays));

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
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "خطأ غير معروف";
    return NextResponse.json(
      { error: "خطأ داخلي: " + errorMessage },
      { status: 500 }
    );
  }
}
